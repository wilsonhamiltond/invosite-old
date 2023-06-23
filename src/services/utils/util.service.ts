import { Injectable } from "@angular/core";
import { IModule, ModuleModel } from "../../models/security/module.model";
import { IField } from "../../models/administration/field.model";
import { Observable, forkJoin } from "rxjs";
import { share } from "rxjs/operators";

export let loginTrigger: any;
export const OnLoginChange: Observable<any> = new Observable(
  (observable: any) => {
    loginTrigger = observable;
  }
).pipe(share());

export let logoffTrigger: any;
export const OnLogoffChange: Observable<any> = new Observable(
  (observable: any) => {
    logoffTrigger = observable;
  }
).pipe(share());

export let titleTrigger: any;
export const OnTitleChange: Observable<any> = new Observable(
  (observable: any) => {
    titleTrigger = observable;
  }
).pipe(share());

export let valueChangeTrigger: any;
export const OnValueChange: Observable<any> = new Observable(
  (observable: any) => {
    valueChangeTrigger = observable;
  }
).pipe(share());

export let valueRequireTrigger: any;
export const OnValueRequire: Observable<any> = new Observable(
  (observable: any) => {
    valueRequireTrigger = observable;
  }
).pipe(share());

export let chatViewerTrigger: any;
export const OnChatViewer: Observable<any> = new Observable(
  (observable: any) => {
    chatViewerTrigger = observable;
  }
).pipe(share());

export let activeBoxTrigger: any;
export const OnActiveBoxDialogOpen: Observable<any> = new Observable(
  (observable: any) => {
    activeBoxTrigger = observable;
  }
).pipe(share());

export const requestOptions: any = {
  headers: {
    "Content-Type": "application/json",
  },
};

export function SetUserModules(m: IModule): void {
  sessionStorage.setItem("ls_current_module", JSON.stringify(m));
}

export let loadedTrigger: any;
export const OnLoadedChange: Observable<any> = new Observable(
  (observable: any) => {
    loadedTrigger = observable;
  }
).pipe(share());

export let breadcrumbChangeTrigger: any;
export const OnBreadcrumbChange: Observable<any> = new Observable(
  (observable: any) => {
    breadcrumbChangeTrigger = observable;
  }
).pipe(share());

export function GetCurrentModule(): IModule {
  let m: IModule = new ModuleModel();
  const moduleObj = sessionStorage.getItem("ls_current_module");
  if (moduleObj) {
    m = <IModule>JSON.parse(moduleObj);
  }

  return m;
}

(Date.prototype as any)["daysBetween"] = (date1: Date, date2: Date) => {
  const one_day = 1000 * 60 * 60 * 24;
  if (typeof date1 == "string") date1 = new Date(date1);
  if (typeof date2 == "string") date2 = new Date(date2);
  const date1_ms = date1.getTime();
  const date2_ms = date2.getTime();
  const difference_ms = date2_ms - date1_ms;
  return Math.round(difference_ms / one_day);
};

export const weekDays: Array<string> = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export const paginate = (
  offset: number,
  limit: number,
  observable: Observable<any>,
  search?: string
): Observable<any> => {
  let paginateTrigger: any;
  observable.subscribe((response: any) => {
    if (response.result == true) {
      response.docs = response.docs.filter((doc: any) => {
        return (
          JSON.stringify(doc).toLowerCase().indexOf((search || '').toLowerCase()) >= 0
        );
      });
      const count = response.docs.length;

      const start = offset * limit;
      const end = start + limit;
      let list = [];
      for (let i = start; i < end; i++) {
        list[i] = response.docs[i];
      }
      list = list.filter((item: any) => {
        return item != undefined;
      });
      paginateTrigger.next({
        count: count,
        list: list,
      });
    } else {
      alert("Error cargando listado de moduols");
      console.log(response.message);
      paginateTrigger.next(false);
    }
  });
  return new Observable((obs: any) => {
    paginateTrigger = obs;
  });
};

export const paginateFilter = (params: any, service: any) => {
  const oservable: any = new Observable<any>((trigger: any) => {
    const sizeRequest = service.size(params),
      dataRequest = service.filter(params);
    forkJoin([sizeRequest, dataRequest]).subscribe((responses: Array<any>) => {
      trigger.next({
        size: responses[0].size,
        data: responses[1].docs,
      });
    });
  });
  return oservable;
};

export const printHTML = (html: string): void => {
  const printWindow: Window | null = window.open(
    "",
    "PRINT",
    "height=600,width=800"
  );
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close(); // necessary for IE >= 10
  printWindow.focus(); // necessary for IE >= 10*/
  setTimeout(function () {
    printWindow["print"]();
    printWindow.close();
  }, 0);
};

export const exlude_fields = (keys: Array<any>) => {
  const fields: any = {};
  keys.forEach((p: string) => {
    fields[p] = false;
  });
  return fields;
};

@Injectable()
export class UtilService {
  public static clone(object: any): any {
    const obj: any = {};
    for (const attribut in object) {
      if (typeof object[attribut] === "object") {
        obj[attribut] = UtilService.clone(object[attribut]);
      } else {
        obj[attribut] = object[attribut];
      }
    }
    return obj;
  }
  public static field_names(
    objects: Array<any>,
    container: any,
    is_invoiced: boolean = false
  ): Array<string> {
    const field_names: Array<string> = [];
    objects.forEach((object: any) => {
      container.fields
        .sort((f: IField, l: IField) => {
          return f.order <= l.order ? -1 : 1;
        })
        .forEach((field: IField) => {
          if (
            field.type != "file" &&
            ((is_invoiced && field.show_on_invoice) || !is_invoiced) &&
            field_names.indexOf(field.text.toString()) < 0
          )
            field_names.push(field.text.toString());
        });
    });
    return field_names;
  }

  public static add_fields(
    object: any,
    container: any,
    is_invoiced: boolean = false
  ): any {
    container.fields
      .sort((f: IField, l: IField) => {
        return f.order <= l.order ? -1 : 1;
      })
      .forEach((field: IField) => {
        if ((is_invoiced && field.show_on_invoice) || !is_invoiced)
          object[field.text.toString()] = field.value;
      });
    return object;
  }
}
