export class Recipe {
    constructor(
        public label: string = '',
        public ingredientLines: string[] = [],
        public url: string = '',
        public dietLabels: string[] = [],
        public image: string = '',
        public _id?: string,
    ) { }

    setId?(id: string = 'r101') {
        this._id = id
    }
}


export interface FilterBy {
    term: string
}
