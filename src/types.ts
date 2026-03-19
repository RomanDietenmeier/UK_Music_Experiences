export interface Opportunity {
  id: number;
  name: string;
  address: string;
  region: string;
  county: string;
  location: string;
  type: string;
  ensemble: string;
  genre: string;
  age: string;
  level: string;
  instruments: string;
  otherTags: string;
  cost: string;
  about: string;
  when: string;
  website: string;
  organisationName: string;
  aboutOrganisation: string;
  organisationWebsite: string;
  localOnly: string;
  extraNotes: string;
  lat: number | null;
  lng: number | null;
}
