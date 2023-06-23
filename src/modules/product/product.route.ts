import { ProductCreateComponent } from './components/create.component';
import { ProductListComponent } from './components/list.component';
import { StockCreateComponent } from './components/stock.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: ProductListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: ProductCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: ':_id/stock', 
            component: StockCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }]
    }
];

export const ProductRouting = RouterModule.forChild(routes);