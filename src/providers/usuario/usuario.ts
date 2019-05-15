import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import { Subscription } from 'rxjs';


@Injectable()
export class UsuarioProvider {

  clave:string ;
  empresa:string;
  user:any = {};
  public doc: Subscription;
  guardado:boolean = false;

  constructor( private afDB: AngularFirestore, private storage: Storage, private platform:Platform) {
    console.log('Hello UsuarioProvider Provider');
      
    if(this.platform.is('cordova')){
      /* movil */
      this.storage.get('clave').then( clave =>{
              
              this.clave = clave;
          
      });
      this.storage.get('empresa').then(nombre =>{
        
            this.empresa = nombre;
         
      });
    }else{
        /* Escritorio */
        this.clave = localStorage.getItem('clave');
        this.empresa = localStorage.getItem('empresa');
        console.log(this.clave, this.empresa);
    }
  }

  verificarPlataforma(){
    if(this.platform.is('cordova')){
      /* movil */
      this.storage.get('clave').then( clave =>{
              
              this.clave = clave;
          
      });
      this.storage.get('empresa').then(nombre =>{
        
            this.empresa = nombre;
         
      });
    }else{
        /* Escritorio */
        this.clave = localStorage.getItem('clave');
        this.empresa = localStorage.getItem('empresa');
        console.log(this.clave, this.empresa);
    }
  }

  verificarUsuario(clave:string, empresa:string){
    
    //Recibe la clave y la transforma a miniscula
    this.clave = clave.toLocaleLowerCase();
    this.empresa = empresa.toLocaleLowerCase();
    //El metodo retorna una promesa
    return new Promise((resolve, reject) =>{
      
      //Hacemos referencia al objeto y nos subscribimos
    this.doc = this.afDB.collection(`${this.empresa}`).doc(`movil`).collection(`usuarios`).doc(`${this.clave}`)
            .valueChanges().subscribe(data =>{
              //Si existe la data
              if(data){
                //Correcto
                console.log(data);
                this.clave = clave;
                this.user = data;
                resolve(true);
                this.guardarStorage();
                console.log("el storage a sido guardado");
              }else{
                //Incorrecto
                resolve(false);
              }

            });

        /* this.detenerSub(this.doc); */
    });
  }

  detenerSub(){
        this.doc.unsubscribe();
  }

  guardarStorage(){
    //Verificamos en que plataforma estamos
      if(this.platform.is('cordova')){
        //Celular
          this.storage.set('clave', this.clave);
          this.storage.set('empresa', this.empresa);
      }else{
        //Escritorio
          localStorage.setItem('clave', this.clave);
          localStorage.setItem('empresa', this.empresa);
      }   
  }

  cargarStorage(){
    //Retornamos una promesa
    return new Promise((resolve, reject)=>{
      //Verificamos en que plataforma estamos
        if(this.platform.is('cordova')){
          //Celular
          this.storage.get('clave').then( val=>{
            //Si existe Valor
            if(val){
              //Correcto
              this.clave = val;
              resolve(true);
            }else{
              //Incorrecto
              resolve(false);
            }
          });
        }else{
          //Escritorio
            if(localStorage.getItem('clave')){
                this.clave = localStorage.getItem('clave');
                resolve(true)
            }else{
                resolve(false);
            }
        }
    });
    
  }

  borrarStorage(){
    this.clave = null;
    if (this.platform.is('cordova')) {
      //Celular
      this.storage.remove("clave");
      this.storage.remove('empresa');
      console.log("storage borrado celular");
    }else{
      //Escritorio
      localStorage.removeItem("clave");
      localStorage.removeItem('empresa');
      console.log("storage borrado");
    }
    this.guardado = false;
  }

}
