import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  IProductionGeneration,
  ProductionGenerationModel,
} from "../../../models/production/generation.model";
import { ProductionGenerationService } from "../../../services/production/generation.service";

import { IProductionConfig } from "../../../models/production/config.model";
import { ProductionConfigService } from "../../../services/production/config.service";

import {
  titleTrigger,
  GetCurrentModule,
} from "../../../services/utils/util.service";
import { NotifyService } from "../../../services/utils/notify.service";
import { Observable, forkJoin } from "rxjs";

import { LoadingComponent } from "../../utils/components/loading.component";

@Component({
  selector: "generation-create",
  template: `
    <form #generationForm="ngForm" novalidate (ngSubmit)="save()">
      <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content *ngIf="generation">
          <div class="col-md-12">
            <mat-form-field style="width: 100%">
              <input
                matInput
                type="text"
                name="config"
                #config="ngModel"
                required
                [(ngModel)]="generation.config"
                (keyup)="filterConfig($event)"
                value="{{ config }}"
                placeholder="Configuración"
                [matAutocomplete]="configAuto"
              />
            </mat-form-field>
            <mat-autocomplete
              #configAuto="matAutocomplete"
              [displayWith]="displayFn"
            >
              <mat-option
                (onSelectionChange)="changeConfig($event)"
                *ngFor="let config of filteredConfigs"
                [value]="config"
              >
                {{ config.description }}
              </mat-option>
            </mat-autocomplete>
            <input
              type="hidden"
              name="selectedConfig"
              [(ngModel)]="selectedConfig"
              required
            />
          </div>
          <div class="col-md-12 no-padding">
            <div class="col-md-6">
              <mat-form-field style="width: 100%">
                <input
                  name="generation_date"
                  #generation_date="ngModel"
                  [(ngModel)]="generation.date"
                  required
                  matInput
                  [matDatepicker]="generation_date_picker"
                  placeholder="Fecha"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="generation_date_picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #generation_date_picker></mat-datepicker>
              </mat-form-field>
            </div>
            <div class="col-lg-6">
              <mat-form-field style="width: 100%">
                <input
                  matInput
                  name="quantity"
                  type="number"
                  step="any"
                  required
                  #quantity="ngModel"
                  [(ngModel)]="generation.quantity"
                  placeholder="Cantidad"
                />
              </mat-form-field>
            </div>
          </div>
          <div class="col-md-12">
            <mat-form-field style="width: 100%">
              <textarea
                matInput
                name="note"
                required
                rows="4"
                #note="ngModel"
                [(ngModel)]="generation.note"
                placeholder="Nota"
              ></textarea>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button
            type="button"
            [routerLink]="['/admin/production/generation/list']"
            mat-raised-button
            color="warn"
          >
            <mat-icon class="link">close</mat-icon> Cancelar
          </button>
          <button
            *ngIf="module.add || module.edit"
            type="subbmit"
            [disabled]="!generationForm.valid"
            mat-raised-button
            color="primary"
          >
            Guardar <mat-icon class="link">check</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
  providers: [ProductionGenerationService, ProductionConfigService],
})
export class GenerationCreateComponent implements AfterViewInit {
  public generation: IProductionGeneration;
  public module: any;
  public filteredConfigs: Array<IProductionConfig> = [];
  public configs: Array<IProductionConfig | any>;
  public selectedConfig: string;

  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;

  constructor(
    public activatedRoute: ActivatedRoute,
    public notify: NotifyService,
    public router: Router,
    public productionConfigService: ProductionConfigService,
    public productionGenerationService: ProductionGenerationService
  ) {
    titleTrigger.next("GENERACIÓN DE PRODUCCIÓN");
    this.module = GetCurrentModule();
    this.generation = new ProductionGenerationModel();
  }

  ngAfterViewInit() {
    this.loadingComponent.showLoading("Cargando datos de generación...");
    this.activatedRoute.params["subscribe"]((paramns: any) => {
      const _id = paramns["_id"],
        requests: Array<Observable<any>> = [];
      requests.push(this.productionConfigService.filter({}));
      if (_id != "0") {
        requests.push(this.productionGenerationService.get(_id));
      } else {
        this.generation = new ProductionGenerationModel();
      }
      forkJoin(requests).subscribe((responses: any) => {
        this.configs = responses[0].docs;
        if (_id != "0") {
          this.generation = <IProductionGeneration>responses[1].doc;
          this.generation.date = new Date(this.generation.date);
          this.selectedConfig = this.generation.config.description.toString();
        } else {
          this.filterConfig({ target: { value: "" } });
        }
        this.loadingComponent.hiddenLoading();
      });
    });
  }

  changeConfig(event: any) {
    if (!event.isUserInput) return;
    if (event.source.value)
      this.selectedConfig = event.source.value.description;
  }

  displayFn(config: IProductionConfig): string {
    if (!config) return "";
    return config.description ? config.description.toString() : "";
  }

  filterConfig(event: any) {
    this.filteredConfigs = event.target.value
      ? this.configs.filter(
          (c) =>
            c.description
              .toString()
              .toLowerCase()
              .indexOf(event.target.value.toLowerCase()) >= 0
        )
      : this.configs;
    //delete this.filteredConfigs;
  }

  save() {
    this.loadingComponent.showLoading("Guardando generación...");
    let request: Observable<any>;
    if (!this.generation._id) {
      request = this.productionGenerationService.save(this.generation);
    } else {
      request = this.productionGenerationService.update(
        this.generation._id,
        this.generation
      );
    }
    request["subscribe"]((response: any) => {
      this.loadingComponent.hiddenLoading();
      if (response.result == true) {
        this.notify.success("Producción generada correctamente.");
        if (this.generation._id) {
          response.doc = this.generation;
        }
        this.router.navigate(["/admin/production/generation/list"]);
      } else {
        this.notify.error("A ocurrido un error en la generación.");
        console.log(response.message);
      }
    });
  }
}
