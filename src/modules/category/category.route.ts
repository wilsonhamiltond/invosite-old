import { CategoryCreateComponent } from './components/create.component';
import { CategoryListComponent } from './components/list.component';
import { CategoryFieldComponent } from './components/fields.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: CategoryListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: CategoryCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: ':_id/fields', 
            component: CategoryFieldComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },]
    }
];

export const CategoryRouting = RouterModule.forChild(routes);