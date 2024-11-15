export interface MovieResponse {
    title: string;
    release_date: string;
    vote_average: number;
    editors: string[];
  }
  
 export interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    vote_average: number;
  }

 export interface CrewMember {
    known_for_department: string;
    name: string;
  }
  
 export interface TMDBMovieCredit {
    id: number;
    crew: CrewMember[]
  }
  
 export interface TMDBDiscoverResponse {
    page: number;
    total_pages: number;
    total_results: number;
    results: TMDBMovie[];
  }