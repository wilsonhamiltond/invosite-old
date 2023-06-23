import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './componenets/home.component';
import { ContactComponent } from './componenets/contact.component';
import { AboutComponent } from './componenets/about.component';
import { SearchComponent } from './componenets/search.component';
import { ProductDetailsComponent } from './componenets/product.details.component';

import { CanActivateService } from '../../services/security/can.active.service';

const routes: Routes = [{ 
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    { 
        path: 'home',
        component: HomeComponent 
    },
    { 
        path: 'contact',
        component: ContactComponent 
    },
    { 
        path: 'about',
        component: AboutComponent 
    },
    { 
        path: 'search/:category/:query',
        component: SearchComponent 
    },
    { 
        path: 'product/:_id/details',
        component: ProductDetailsComponent 
    }
];

export const SiteRouting = RouterModule.forChild(routes);