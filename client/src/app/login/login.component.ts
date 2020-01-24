import {Component} from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})
export class LoginComponent {
    challengeId: string;
    public username: string;
    public password: string;
    public error: string;

    constructor(private auth: AuthService, private router: Router) {
    }

    public submit() {
        if (!this.challengeId) {
            this.auth.prelogin(this.username, this.password)
                .pipe(first())
                .subscribe(
                    result => {this.password='';this.challengeId = result;},
                    err => this.error = 'Could not authenticate'
                );
        } else {
            // LOGIN
            this.auth.login(this.challengeId, this.password)
                .pipe(first())
                .subscribe(
                    result => this.router.navigate(['todos']),
                    err => this.error = 'Could not authenticate'
                );
        }

    }
}
