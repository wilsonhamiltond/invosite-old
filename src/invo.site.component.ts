import { Component } from "@angular/core";

@Component({
  selector: "invo-site",
  template: ` <router-outlet></router-outlet>`,
})
export class InvoSiteComponent {
  constructor() {
    console.log('App Loaded')
  }
}
