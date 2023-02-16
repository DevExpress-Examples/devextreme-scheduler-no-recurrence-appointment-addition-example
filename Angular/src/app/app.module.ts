import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSchedulerModule, DxPopupModule } from 'devextreme-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    DxSchedulerModule,
    DxPopupModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
