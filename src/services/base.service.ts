import { HttpClient } from "@angular/common/http";
import { logoffTrigger } from "./utils/util.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

export class BaseService {
  public http: HttpClient;
  public document_name: string;
  public base_url: string = "";
  constructor(http: HttpClient, document_name: string) {
    this.http = http;
    this.document_name = document_name;
    this.base_url = `${environment.apiv1}${document_name}`;
  }

  list() {
    return this.request("get", this.base_url);
  }
  get(_id: string) {
    return this.request("get", `${this.base_url}/${_id}`);
  }
  save(_object: any) {
    return this.request("post", this.base_url, _object);
  }
  update(_id: string, _object: any) {
    return this.request("put", `${this.base_url}/${_id}`, _object);
  }
  delete(_id: string) {
    return this.request("delete", `${this.base_url}/${_id}`);
  }

  filter(params: any) {
    return this.request("post", `${this.base_url}/filter`, params);
  }

  unauthorizad_filter(params: any) {
    return this.request("post", `${this.base_url}/unauthorizad_filter`, params);
  }
  unauthorizad_size(params: any) {
    return this.request("post", `${this.base_url}/unauthorizad_size`, params);
  }

  size(params: any) {
    return this.request("post", `${this.base_url}/size`, params);
  }
  aggregate(params: any) {
    return this.request("post", `${this.base_url}/aggregate`, params);
  }
  request(method: string, url: string, _object?: any) {
    return new Observable<any>((subscriber) => {
      const requestOptions = {
        'Content-Type': 'application/json'
    }
      let httpRequest;
      if (_object)
        httpRequest = this.http.request(method, url, {
          body: _object,
          headers: requestOptions,
        });
      else
        httpRequest = this.http.request(method, url, {
          headers: requestOptions,
        });

      httpRequest.subscribe(
        (resopnse: any) => {
          subscriber.next(resopnse);
          subscriber.complete();
        },
        (error: any) => {
          switch (error.status) {
            case 401:
              logoffTrigger.next(error._body);
              break;
            default:
              break;
          }
        }
      );
    });
  }

  upload(file: File): Observable<any> {
    return new Observable((observable) => {
      const formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();
      formData.append(this.document_name, file, file.name);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observable.next({
              file: JSON.parse(xhr.response).file,
              result: true,
            });
          } else {
            observable.next({
              result: false,
              message: "Error uploading file",
            });
          }
        }
      };

      xhr.open("POST", `${this.base_url}/upload`, true);
      xhr.send(formData);
    });
  }

  send_mail(message: any) {
    return this.request("post", `${this.base_url}/send_mail`, message);
  }

  excel(params: any) {
    let trigger: any;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${this.base_url}/excel`, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.responseType = "blob";

    xhr.onreadystatechange = function () {
      // If we get an HTTP status OK (200), save the file using fileSaver
      if (xhr.readyState === 4 && xhr.status === 200) {
        if (!this.response["result"]) {
          trigger.next({ result: true });
          const blob = new Blob([this.response], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          window.open(window.URL.createObjectURL(blob));
        } else {
          trigger.next(this.response);
        }
      }
    };
    xhr.send(JSON.stringify(params));

    return new Observable((observable) => {
      trigger = observable;
    });
  }
}
