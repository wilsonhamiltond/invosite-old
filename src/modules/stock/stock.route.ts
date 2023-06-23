import { StockListComponent } from './components/list.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'
import { StockTransferComponent } from './components/transfer.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: StockListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }, { 
            path: 'transfer', 
            component: StockTransferComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }]
    }
];

export const StockRouting = RouterModule.forChild(routes);