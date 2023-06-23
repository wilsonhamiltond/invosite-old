import { Component, Input } from "@angular/core";
import {
  IField,
  OptionModel,
} from "../../../models/administration/field.model";

@Component({
  selector: "option-field",
  templateUrl: "./option.field.directive.html",
})
export class OptionFieldDirective {
  @Input()
  field: IField;

  @Input()
  parent: string;

  show_options() {
    return this.field.options.filter((o: OptionModel) => {
      return o.parent_value == this.parent;
    });
  }

  add() {
    const option = new OptionModel();
    if (this.parent) option.parent_value = this.parent;
    this.field.options.push(option);
  }

  delete(index: number) {
    let i = -1;
    this.field.options = this.field.options.filter((o: OptionModel) => {
      if (!this.parent || this.parent == o.parent_value) {
        i++;
      }
      return i != index;
    });
  }
}
