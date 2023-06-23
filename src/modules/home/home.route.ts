import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './componenets/home.component';
import { InfoComponent } from './componenets/info.component';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'
import { SearchResultComponent } from './componenets/search.result.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: '', redirectTo: 'home', pathMatch: 'full'
            },
            { 
                path: 'home',
                component: HomeComponent 
            },
            { 
                path: 'info',
                component: InfoComponent 
            },
            { 
                path: 'search/:_query/result',
                component: SearchResultComponent 
            }
        ]
    }
];

export const HomeRouting = RouterModule.forChild(routes);