{
  description = "Engram notes server";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-stable";
    engramware.url = "github:szewczyk-bartosz/engramware";
  };

  outputs = {
    self,
    nixpkgs,
    engramware,
  }: {
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

        user = lib.mkOption {
          type = lib.types.str;
          description = "User to run the engram service as.";
          example = "cheryllamb";
        };
      };

      config = lib.mkIf cfg.enable {
        systemd.tmpfiles.rules = [
          "d /var/lib/engram          0755 ${cfg.user} ${cfg.user} - -"
          "d /var/lib/engram/engrams  0755 ${cfg.user} ${cfg.user} - -"
        ];

        system.activationScripts.engram-static = lib.stringAfter ["users"] ''
          cp -r ${self}/. /var/lib/engram/
          chmod -R u+w /var/lib/engram
          chown -R ${cfg.user} /var/lib/engram
        '';

        systemd.services.engram-api = {
          description = "Engram sync API";
          wantedBy = ["multi-user.target"];
          after = ["network.target"];
          serviceConfig = {
            ExecStart = "${pkgs.python3}/bin/python3 ${self}/server.py -i ${cfg.notesDir} --web-root /var/lib/engram";
            Restart = "always";
            User = cfg.user;
            PrivateTmp = true;
            ProtectSystem = "strict";
            ReadWritePaths = ["/var/lib/engram"];
            ReadOnlyPaths = [cfg.notesDir];
            NoNewPrivileges = true;
          };
          path = [pkgs.python3 engramware.packages.${pkgs.system}.bmd];
        };

        services.caddy = {
          enable = true;
          virtualHosts."http://${config.networking.hostName}".extraConfig = ''
            root * /var/lib/engram
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
