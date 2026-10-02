{
  description = "Engram notes server";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-26.05";

    engramware = {
      url = "github:szewczyk-bartosz/engramware";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    engramware,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      lib = pkgs.lib;
      start-engram = pkgs.writeShellScriptBin "start-engram" ''
        start_vite() {
          tmux send-keys -t $1 'npm run dev' Enter
        }

        start_python() {
          tmux send-keys -t $1 'python3 server.py -i ./engram-raw-for-testing/ --web-root ./.' Enter
        }

        setup_servers() { local target=$1
          start_vite $target.1
          tmux split-window -t $target -h
          start_python $target.2
        }

        restart_if_dead() {
          local target=$1
          if [ "$(tmux display-message -t $target.1 -p '#{pane_current_command}')" != "node" ]; then
            start_vite $target.1
          fi
          if [ "$(tmux display-message -t $target.2 -p '#{pane_current_command}')" != "python" ]; then
            start_python $target.2
          fi
        }

        npm install
        if [ -z "$TMUX" ]; then
          tmux new-session -d -s engram
          tmux rename-window -t engram servers
          setup_servers engram:servers
        else
          if ! tmux list-windows | grep -q servers; then
            tmux new-window -n servers
            setup_servers servers
          else
            restart_if_dead servers
          fi
        fi
      '';
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [tmux nodejs_26 python3 engramware.packages.${system}.bmd] ++ [start-engram];
        shellHook = ''
          if [ -n "$ENGRAM_DEV_SHELL" ]; then
            echo "WARNING!!!!"
            echo "ALREADY IN A SHELL"
            echo "WARNING!!!!"
            exit
          fi
          export ENGRAM_DEV_SHELL=1
          echo "Engram dev shell loaded! Run start-engram to start dev servers."
        '';
      };
      packages.default = pkgs.buildNpmPackage {
        name = "engram";
        src = ./.;
        npmDepsHash = "sha256-TkzZ0dXCPkLKZ1LH5479zT+VLkXxbW9g9jT3fJ2w67Y=";
        npmBuildScript = "build";
        installPhase = ''
          cp -r dist $out
        '';
      };
    })
    // {
      nixosModules.default = {
        config,
        lib,
        pkgs,
        ...
      }: let
        cfg = config.services.engram;
      in {
        options.services.engram = {
          enable = lib.mkEnableOption "engram notes server";

          notesDir = lib.mkOption {
            type = lib.types.str;
            description = "Directory containing raw .eng source files.";
            example = "/home/cheryllamb/engram-data";
          };

          webRoot = lib.mkOption {
            type = lib.types.str;
            description = "Directory to put the webroot into";
            example = "/var/lib/engram";
          };

          user = lib.mkOption {
            type = lib.types.str;
            description = "User to run the engram service as.";
            example = "cheryllamb";
          };
        };

        config = lib.mkIf cfg.enable {
          systemd.tmpfiles.rules = [
            "d ${cfg.webRoot}          0755 ${cfg.user} ${cfg.user} - -"
          ];

          systemd.services.engram-api = {
            description = "Engram sync API";
            wantedBy = ["multi-user.target"];
            after = ["network.target"];
            serviceConfig = {
              ExecStart = "${pkgs.python3}/bin/python3 ${self}/server.py -i ${cfg.notesDir} --web-root ${cfg.webRoot}";
              Restart = "always";
              User = cfg.user;
              PrivateTmp = true;
              ProtectSystem = "strict";
              ReadWritePaths = [cfg.webRoot];
              ReadOnlyPaths = [cfg.notesDir];
              NoNewPrivileges = true;
            };
            path = [pkgs.python3 engramware.packages.${pkgs.system}.bmd];
          };

          services.caddy = {
            enable = true;
            virtualHosts."http://${config.networking.hostName}".extraConfig = ''
              root * ${self.packages.${pkgs.system}.default}
              handle /api/* {
                reverse_proxy localhost:8001
              }
              file_server
            '';
          };
        };
      };
    };
}
