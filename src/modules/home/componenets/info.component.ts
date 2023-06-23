import { Component, AfterViewInit } from '@angular/core';

@Component({
    selector: 'info',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
            <div class="col-md-12 no-padding">
                <div class="panel-heading" style="background-color:white">
                    <h2 style="margin-bottom:20px;margin-left:15px; color:#081934; border-bottom: 1px dashed #1861BA;"><b>Información de Aplicación</b></h2>
                    <p><span class="col-md-3"><b>Nombre: </b></span><span class="col-8 ng-binding">INVOICE SITE ( INVOSITE ) </span></p>
                    <p><span class="col-md-3"><b>Version: </b></span><span class="col-8 ng-binding">1.0.0</span></p>
                    <p><span class="col-md-3"><b>Fecha de Publicación: </b></span><span class="col-8 ng-binding">1 de Julio, 2017</span></p>
                </div>
                <div class="panel-heading" style="background-color:white">
                    <h2 style="margin-bottom:20px;margin-left:15px; color:#081934; border-bottom: 1px dashed #1861BA;"><b>Soporte técnico</b></h2>
                    <p><span class="col-md-3"><b>Nombre: </b></span><span class="col-8">Ing. Wilson A. Hamilton D.</span></p>
                    <p><span class="col-md-3"><b>Telefono: </b></span><span class="col-8">wilsonhamiltond@gmail.com</span></p>
                    <p><span class="col-md-3"><b>Email: </b></span><span class="col-8">(829) 494-9665</span></p>
                </div>
                <div class="panel-heading" style="background-color:white">
                    <h2 style=" margin-left:15px; border-bottom: 1px dashed #1861BA;"><b>Desarrollador</b></h2>
                    <p><span class="col-md-3"><b>Nombre: </b></span><span class="col-8 ng-binding">Ing. Wilson Hamilton</span></p>
                    <p><span class="col-md-3"><b>Email: </b></span><span class="col-8 ng-binding">wilsonhamiltond@gmail.com</span></p>
                    <p><span class="col-md-3"><b>Teléfono: </b></span><span class="col-8 ng-binding">(829) 494-9665</span></p>
                </div>
            </div>
        </mat-card-content>
    </mat-card>
    `
})

export class InfoComponent implements AfterViewInit {
    constructor() { }

    ngAfterViewInit() { }
}