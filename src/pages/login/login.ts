import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController } from 'ionic-angular';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { HomePage } from '../home/home';
import swal from 'sweetalert';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';





@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  
   usuario:any = {};
   empresa:string;
   password:string;

 /*   conductorSub: Subscription; */

  @ViewChild(Slides) slides: Slides

  constructor(public loadingCrl: LoadingController, private alertCtrl: AlertController,
               public navCtrl: NavController, public navParams: NavParams, public _usuarioProv: UsuarioProvider,
               public _ubicacion: UbicacionProvider, public db:AngularFirestore) {
  }

  ionViewDidLoad() {
    //Cambiamos el tipo de paginacion.
    this.slides.paginationType = 'progress';
    //bloqueamos el swipe para que el usuario no pueda moverse
    this.slides.lockSwipes(true);
    this.slides.freeMode = false;
  }

  async abrirPromp(){
    /* let alert = this.alertCtrl.create({
      title: 'Ingresa',
      inputs: [
        {
          name: 'password',
          placeholder: 'password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data =>{
            console.log("usuario a cancelado")
          }
        },
        {
          text: 'Ingresar',
          handler: data =>{
            console.log(data);
            if(data.password){
              this.verificarUsuario(data.password);
            }else{
              this.verificarUsuario("null");
            }
          }
        }
      ]
    });
    alert.present(); */
      if(this.empresa){
          
              swal({
                title:'Ingresa tu contraseña',
                content: {
                  element: "input",
                  attributes: {
                    placeholder: "Escribe una Contraseña",
                    type: "password"
                  }
                },
                className: "swal-color",
                timer : 12000
              }).then(password=>{
                if(password){
                    this.verificarUsuario(password, this.empresa);
                }else{
                  swal("Ingrese contraseña", "Intente ingresando una contraseña", "warning", {
                    timer: 2500,
                    className:"swal-color"  
                  })
                }
              });
          
      }else{

        return false;
      }
  }

  /* METODO DE VERIFICACION DE LOS USUARIOS */
  verificarUsuario(clave:string, empresa:string){
    
    let loading = this.loadingCrl.create({
      content: 'Verificando'
    });
    
    loading.present()

    this._usuarioProv.verificarUsuario(clave, empresa)
                .then(existe =>{
                  if(existe){
                    loading.dismiss();
                    this.slides.lockSwipes(false);
                    this.slides.freeMode = true;
                    this.slides.slideNext();
                    this.slides.lockSwipes(true);
                    this.slides.freeMode = false;
                    this._ubicacion.iniciarTaxista();
                    this._ubicacion.taxista.valueChanges().subscribe((data)=>{
                        this.usuario = data;  
                        console.log(this.usuario);
                    });

                  }else{

                    this.alertCtrl.create({
                      title: 'Contraseña o Empresa Incorrecta',
                      subTitle: 'Reintente o pongase en contacto con la administración',
                      buttons: [
                        'aceptar'
                      ]
                    }).present();
                      
                    loading.dismiss();
                  }
                });

    

  }
  /* FIN METODO */

  irPagina(){
     console.log(this.usuario); 
      this.db.collection(`${this.empresa}`).doc('movil').collection('usuarios').doc(`${this.usuario['clave']}`).update({
      online: true,
      empresa: this.empresa
    }).catch(err =>{
        console.log(err);
    });
    this.navCtrl.setRoot(HomePage);

  }

}
