import Notes from "./Notes";
import Nutrinator from "./Nutrinator";

export const views = {
  notes: Notes,
  nutrinator: Nutrinator,
};

export type ViewTypes = keyof typeof views;
