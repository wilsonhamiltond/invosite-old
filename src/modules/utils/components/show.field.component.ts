import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import {
  IField,
  FieldModel,
  OptionModel,
} from "../../../models/administration/field.model";
import {
  OnValueChange,
  valueChangeTrigger,
  OnValueRequire,
  valueRequireTrigger,
} from "../../../services/utils/util.service";

import { ShowFieldGroupDialog } from "./show.field.group.dialog";
import { MatDialog } from "@angular/material/dialog";

import { FieldService } from "../../../services/administration/field.service";
import { NotifyService } from "../../../services/utils/notify.service";

@Component({
  selector: "show-field",
  styles: [
    `
      .field-image {
        max-height: 200px;
        min-height: 200px;

        height: 100%;
      }
      div.image {
        border: solid 3px #e8e8e8;
        border-radius: 5px;
      }
    `,
  ],
  templateUrl: "./show.field.component.html",
  providers: [FieldService],
})
export class ShowFieldComponent implements AfterViewInit, OnDestroy {
  @Input("field")
  public field: IField | any;

  @Input("parent_field")
  public parent_field: IField;

  @Input("object")
  public object: any;

  @Input("disabled")
  public disabled: boolean;

  @Input("index")
  public index: number;

  @Output("change")
  change = new EventEmitter();

  public valueChangeSubcrition: any;
  public requiredValueSubcrition: any;
  public all_options: Array<OptionModel> = [];
  public text: string = "";
  show: boolean = true;

  constructor(
    public dialog: MatDialog,
    public fieldService: FieldService,
    public zone: NgZone,
    public notify: NotifyService
  ) {
    if (!this.parent_field) {
      this.parent_field = new FieldModel();
      this.parent_field.multiple_instance = false;
    }
  }

  ngOnDestroy() {
    if (this.valueChangeSubcrition) this.valueChangeSubcrition.unsubscribe();
    if (this.requiredValueSubcrition)
      this.requiredValueSubcrition.unsubscribe();
  }

  ngAfterViewInit() {
    this.all_options = [...this.field.options ]
    this.text = this.field.text.toString();
    if (this.field.is_calculate || this.field.parent_field_id) {
      this.valueChangeSubcrition = OnValueChange.subscribe((field: IField) => {
        if (this.field.is_calculate) {
          if (
            field._id == this.field._id ||
            this.field.equation.variables.some((v: any) => {
              return v.code == field._id || !field._id;
            }) == false
          )
            return;
          this.field.equation.variables.forEach((v: any) => {
            if (v.from_parent && this.object[v.code]) {
              v.value = this.object[v.code] || 0;
            } else if (v.code == field._id) {
              v.value = field.value || 0;
            }
          });
          this.calculate();
        }
        if (
          this.field.parent_field_id &&
          this.field.parent_field_id == field._id
        ) {
          if (this.all_options.length <= 0) {
            if (this.field.parent_field_value == field.value) this.show = true;
            else this.show = false;
          } else {
            this.field.options = this.all_options.filter((o) => {
              return !o.parent_value || o.parent_value == field.value;
            });
            this.field.value = "";
            const text = `${this.text} de ${
              field.value || ""
            }`.toLocaleLowerCase();
            this.field.text = text.charAt(0).toUpperCase() + text.slice(1);
          }
        }
      });
      setTimeout(() => {
        valueRequireTrigger.next({});
      }, 100);
    } else {
      this.requiredValueSubcrition = OnValueRequire.subscribe(() => {
        valueChangeTrigger.next(this.field);
      });
    }
    if (this.field.multiple_instance)
      this.field.instances = this.field.instances || [];
    this.field.values = [];
  }

  remove_image() {
    delete this.field.value;
  }

  calculate() {
    let expression = this.field.equation.text + "";
    this.field.equation.variables.forEach((v: any) => {
      const reg = new RegExp(v.name, "g");
      if (v.value >= 0) expression = expression.replace(reg, v.value);
    });
    try {
      const value = eval(expression);
      if (value) {
        if (typeof value == "number") this.field.value = value.toFixed(2);
        else this.field.value = value;
        valueChangeTrigger.next(this.field);
      }
    } catch (e) {
        console.log(e)
    }
  }

  selectChangeValue(event: any) {
    if (event.value) {
      this.field.value = event.value;
      this.changeValue();
    }
  }

  changeValue(value?: string) {
    if (value) {
      this.field.value = this.field.value || [];
      if (this.isChecked(value))
        this.field.value.splice(this.field.value.indexOf(value));
      else this.field.value.push(value);
    }
    try {
      this.change.emit(this.field);
      valueChangeTrigger.next(this.field);
    } catch (e) {
        console.log(e)
    }
  }

  isChecked(value: string) {
    return (this.field.value || []).indexOf(value) >= 0;
  }

  delete(index: number) {
    const result = confirm(`¿Desea borrar este ${this.field.text}?`);
    if (result) {
      this.field.value.splice(index, 1);
    }
  }

  delete_instance() {
    const result = confirm(`¿Desea borrar esta instancia?`);
    if (result) {
      this.parent_field.instances.splice(this.index, 1);
    }
  }

  clear() {
    delete this.field.value;
  }

  add_instance() {
    const field = JSON.parse(JSON.stringify(this.field));
    delete field.instances;
    field.multiple_instance = false;
    this.field.instances.push(field);
    this.clear();
  }

  add(index: number = 0) {
    this.field.value = this.field.value || [];
    const dialogRef = this.dialog.open(ShowFieldGroupDialog, {
      //width: '512px'
    });
    if (index >= 0)
      dialogRef.componentInstance.loadValues(
        this.field,
        Object.assign({}, this.field.value[index])
      );
    else dialogRef.componentInstance.loadValues(this.field);

    dialogRef.afterClosed().subscribe((value: any) => {
      if (value) {
        if (index >= 0) {
          this.field.value[index] = value;
        } else {
          this.field.value.push(value);
        }
      }
    });
  }

  changeFile(e: any) {
    if (e.target.files.length != 0) {
      const file = e.target.files[0];
      const size: number = file.size / 1024 / 1024;
      if (size > 3) {
        this.notify.error(
          `El archivo que esta intentando cargar tiene un tamaño de ${size.toFixed(
            1
          )}mb, El tama���o maximo es 3mb`
        );
        return;
      }
      const FR = new FileReader();
      FR.onload = (e) => {
        if (!e.target) return;
        this.field.value = e.target["result"];
      };
      FR.readAsDataURL(file);

      this.fieldService.upload(file).subscribe((response) => {
        if (response.result == true) {
          this.field["temp_url"] = response.file.filename;
        } else {
          this.notify.error(response["message"]);
        }

        setTimeout(() => {
          this.zone.run(() => true);
        }, 1000);
      });
    }
  }
}
