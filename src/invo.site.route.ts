import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { TemplateComponent } from './components/template.component';
import { SiteTemplateComponent } from './components/site.template.component';

const routes: Routes = [
    
    {
        path: '', redirectTo: 'site', pathMatch: 'full'
    },
    { 
        path: 'login', 
        component: LoginComponent
    },
    { 
        path: 'admin',
        component: TemplateComponent,
        children: [
            {
                path: '', 
                loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
            },
            {
                path: 'home', 
                loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
            },
            {
                path: 'field', 
                loadChildren: () => import('./modules/field/field.module').then(m => m.FieldModule)
            },
            {
                path: 'invoice', 
                loadChildren: () => import('./modules/invoice/invoice.module').then(m => m.InvoiceModule)
            },
            {
                path: 'module', 
                loadChildren: () => import('./modules/module/module.module').then(m => m.ModuleModule)
            },
            {
                path: 'ncf', 
                loadChildren: () => import('./modules/ncf/ncf.module').then(m => m.NcfModule)
            },
            {
                path: 'office', 
                loadChildren: () => import('./modules/office/office.module').then(m => m.OfficeModule)
            },
            {
                path: 'product', 
                loadChildren: () => import('./modules/product/product.module').then(m => m.ProductModule)
            },
            {
                path: 'stock', 
                loadChildren: () => import('./modules/stock/stock.module').then(m => m.StockModule)
            },
            {
                path: 'category', 
                loadChildren: () => import('./modules/category/category.module').then(m => m.CategoryModule)
            },
            {
                path: 'report', 
                loadChildren: () => import('./modules/report/report.module').then(m => m.ReportModule)
            },
            {
                path: 'role', 
                loadChildren: () => import('./modules/role/role.module').then(m => m.RoleModule)
            },
            {
                path: 'service', 
                loadChildren: () => import('./modules/service/service.module').then(m => m.ServiceModule)
            },
            {
                path: 'user', 
                loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
            },
            {
                path: 'client', 
                loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule)
            },
            {
                path: 'provider', 
                loadChildren: () => import('./modules/provider/provider.module').then(m => m.ProviderModule)
            },
            {
                path: 'quotation', 
                loadChildren: () => import('./modules/quotation/quotation.module').then(m => m.QuotationModule)
            },
            {
                path: 'purchase', 
                loadChildren: () => import('./modules/purchase/purchase.module').then(m => m.PurchaseModule)
            },
            {
                path: 'production', 
                loadChildren: () => import('./modules/production/production.module').then(m => m.ProductionModule)
            },
            {
                path: 'payment/method', 
                loadChildren: () => import('./modules/payment.method/payment.method.module').then(m => m.PaymentMethodModule)
            },
            {
                path: 'employee', 
                loadChildren: () => import('./modules/employee/employee.module').then(m => m.EmployeeModule)
            },
            {
                path: 'position', 
                loadChildren: () => import('./modules/position/position.module').then(m => m.PositionModule)
            },
            {
                path: 'activity', 
                loadChildren: () => import('./modules/activity/activity.module').then(m => m.ActivityModule)
            },
            {
                path: 'brand', 
                loadChildren: () => import('./modules/brand/brand.module').then(m => m.BrandModule)
            },
            {
                path: 'tax', 
                loadChildren: () => import('./modules/tax/tax.module').then(m => m.TaxModule)
            },
            {
                path: 'acknowledgment', 
                loadChildren: () => import('./modules/acknowledgment/acknowledgment.module').then(m => m.AcknowledgmentModule)
            },
            {
                path: 'box', 
                loadChildren: () => import('./modules/box/box.module').then(m => m.BoxModule)
            }
        ] 
    },
    {
        path: 'site', 
        component: SiteTemplateComponent,
        children: [
            {
                path: '', 
                loadChildren: () => import('./modules/site/site.module').then(m => m.SiteModule)
            }
        ]
    }
];

export const InvoSiteRouting = RouterModule.forRoot(routes, { useHash: true });
