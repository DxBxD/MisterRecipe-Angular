import { Injectable } from '@angular/core'
import { User } from '../models/user.model'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private user: User

    constructor() {
        this.user = {
            name: 'John Doe',
            recipes: [

            ],
        }
    }

    getUser() {
        return this.user
    }
}
