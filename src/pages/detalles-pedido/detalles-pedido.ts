import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Navbar } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-detalles-pedido',
  templateUrl: 'detalles-pedido.html',
})
export class DetallesPedidoPage {

  @ViewChild('navbar') navBar: Navbar;
  pedido:any;
  estado:string;
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.pedido = this.navParams.get('pedido');
    console.log(this.pedido);

    if(this.pedido.entregado){
          this.estado = "Entregado";
    }else{
          this.estado = "En camino";
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetallesPedidoPage');
  }

}
