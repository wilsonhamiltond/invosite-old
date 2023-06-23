
import { ConfigurationCreateComponent } from './components/config.create.component';
import { ConfigurationListComponent } from './components/config.list.component';
import { GenerationCreateComponent } from './components/generation.create.component';
import { GenerationListComponent } from './components/generation.list.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'config/list', 
            component: ConfigurationListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'config/create/:_id', 
            component: ConfigurationCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },{ 
            path: 'generation/list', 
            component: GenerationListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'generation/create/:_id', 
            component: GenerationCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }]
    }
];

export const ProductionRouting = RouterModule.forChild(routes);