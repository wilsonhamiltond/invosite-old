import { Component, AfterViewInit, OnInit } from '@angular/core';
import { titleTrigger } from '../../../services/utils/util.service';
import { IUser } from '../../../models/security/user.model';
import { IWidget } from '../../../models/security/widget.model';
import { UserService  } from '../../../services/security/user.service';

@Component({
    styles: [`
        md-card{
            width: 80%;
        }
        .block{
            width: 100%;
        }
        .widget{
            border: solid 1px #ddd;
            border-radius: 2px;
            padding-left: 0;
            padding-right: 0;
            box-shadow: 2px 3px 7px 0px #bbbbbb;
        }
    `],
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
    public user:IUser;
    public widgets: Array<IWidget> = [];
    constructor( public userService: UserService) {
        titleTrigger.next( 'INICIO' );
        this.user = this.userService.getUser()
     }

    ngOnInit() {
        this.user.roles.forEach( rol =>{
            rol.widgets.forEach( widget =>{
                if( this.widgets.some(w => {return w.name == widget.name}) == false)
                    this.widgets.push(widget);
            })
            this.widgets = this.widgets.sort( ( s:IWidget, e:IWidget)=>{
                return s.order < e.order? -1 : 1;
            })
        })
    }
}