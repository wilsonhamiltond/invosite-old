import { AcknowledgmentCreateComponent } from './components/create.component';
import { AcknowledgmentListComponent } from './components/list.component';
import { AcknowlegmentPrintComponent } from './components/print.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: AcknowledgmentListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: AcknowledgmentCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: ':_id/print', 
            component: AcknowlegmentPrintComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }
        ]
    }
];

export const AcknowledgmentRouting = RouterModule.forChild(routes);