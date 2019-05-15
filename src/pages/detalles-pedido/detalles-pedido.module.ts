import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetallesPedidoPage } from './detalles-pedido';

@NgModule({
  declarations: [
    DetallesPedidoPage,
  ],
  imports: [
    IonicPageModule.forChild(DetallesPedidoPage),
  ],
})
export class DetallesPedidoPageModule {}
