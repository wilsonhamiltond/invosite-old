import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { IProduct } from '../../../models/inventory/product.model';
import { ConfirmDialog } from './confirm.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
    styles: [`
        .button-container .item{
            height: 48px;
            padding: 15px 15px;
            background: #efefef;
            border: solid 1px #d9d7d7;
            text-align: center;
        }
        .button-container .item.cancel{
            background-color: #F44336;
            padding: 10px 15px;
        }
        .button-container .item.active{
            background-color: #4CAF50;
        }
        .button-container .item.cancel span{
            top: -5px;position: relative;
        }
        .button-container .item:hover{
            background-color: #dedede;
            cursor: pointer;
        }
        .button-container .item.payment{
            height: 144px;
        }
        .button-container .item.number{
            font-size: 20pt;
            padding: 5px 20px;
            font-weight: bold;
            color: #727272;
        }
        .button-container .item.increase{
            background-color: #4CAF50;
            padding: 0px 20px;
        }
        .button-container .item.decrease{
            background-color: #FF5722;
            padding: 0px 20px;
        }        
        .button-container .item span.active{
            font-size: 20pt;            
        }
    `],
    selector: 'product-calculate',
    templateUrl: './product.calculate.component.html'
})

export class ProductCalculateWidget {
    
    public product:IProduct;
    
    @Output('cancel')
    public cancel = new EventEmitter();

    @Output('delete')
    public delete = new EventEmitter();

    @Output('change')
    public change = new EventEmitter();

    public increase:boolean = true;
    public action:string = 'quantity';
    public parent:string = '';

    @Output('save')
    public save = new EventEmitter();

    constructor(
        public dialog: MatDialog
    ) { }

    set_product(product:IProduct){
        this.product = Object.assign({}, product);
        /*
        this.action = 'quantity';*/
    }

    invoce(){
        this.save.emit();
    }

    cancel_invoice(){
        if(!this.product)
            return;
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea cancelar esta factura?',
            title: 'FACTURACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.cancel.emit();
            }
        })
    }
    
    remove( ){
        if(!this.product)
            return;
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea borrar este producto?',
            title: 'FACTURACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.delete.emit(this.product);
            }
        })
    }

    number(n:number){
        if(!this.product)
            return;
        let parent = this.product;
        if(this.parent)
            parent = (this.product as any)[this.parent];
        if(this.increase)
            (parent as any)[this.action] += n;
        else
            (parent as any)[this.action] -= n;
        if((parent as any)[this.action] <=0 ){
            this.increase = true;
            if(this.parent)
                (parent as any)[this.action] = 0;
            else
                (parent as any)[this.action] = 1;
        }
        const product = Object.assign( {}, this.product);
        this.change.emit(product);
    }
}