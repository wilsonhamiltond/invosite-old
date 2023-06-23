import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  NgZone,
  Output,
  EventEmitter,
} from "@angular/core";
import { LoadingComponent } from "./loading.component";
import { BaseService } from "../../../services/base.service";
import { NotifyService } from "../../../services/utils/notify.service";

@Component({
  styles: [
    `
      .upload_button {
        width: 100%;
        border: none;
        background-color: #4caf50;
        color: white;
      }
      img.logo {
        height: 100%;
        max-width: 100%;
      }
    `,
  ],
  selector: "file-upload",
  templateUrl: "./file.upload.component.html",
})
export class FileUploadComponent {
  @ViewChild("image")
  public image!: ElementRef;

  @Input("service")
  service!: BaseService;

  @Input("image_url")
  image_url!: string;

  @Output("upload")
  upload = new EventEmitter();

  @ViewChild(LoadingComponent)
  public loadingComponent!: LoadingComponent;

  constructor(public zone: NgZone, public notify: NotifyService) {}

  changeFile(e: any) {
    if (e.target.files.length != 0) {
      const file = e.target.files[0];
      const size: number = file.size / 1024 / 1024;
      if (size > 3) {
        this.notify.error(
          `El archivo que esta intentando cargar tiene un tamaño de ${size.toFixed(
            1
          )}mb, El tamaño maximo es 3mb`
        );
        return;
      }
      const FR = new FileReader();
      FR.onload = (e) => {
        if (e.target) this.image.nativeElement.src = e.target["result"];
      };
      FR.readAsDataURL(file);

      this.loadingComponent.showLoading("");
      this.service.upload(file).subscribe((response: any) => {
        if (response.result == true) this.upload.emit(response.file.filename);
        else this.notify.error(response["message"]);

        this.loadingComponent.hiddenLoading();
        setTimeout(() => {
          this.zone.run(() => {
            console.log('')
          });
        }, 1000);
      });
    }
  }
}
