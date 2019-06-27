import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UsuarioProvider } from '../usuario/usuario';
import { Subscription } from 'rxjs';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@Injectable()
export class UbicacionProvider {

  conductor: AngularFirestoreDocument<any>;
  private watch: Subscription;

  empresa:string;
  clave:string;


  constructor(private geolocation: Geolocation, private afDB: AngularFirestore,
              private _usuarioProv: UsuarioProvider,public platform: Platform,
              private storage:Storage) {
      
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

  iniciarConductor(){

          //Apuntamos al taxita de tipo AngularFireStoreDocument a la Base de datos
          
          this.conductor = this.afDB.collection('locales').doc(`${this._usuarioProv.empresa}`).collection(`movil`).doc(`${this._usuarioProv.clave}`);
          var docRef =  this.afDB.collection('locales').doc(`${this.empresa}`);
          docRef.snapshotChanges().subscribe(data=>{
            console.log(data.payload);
          });
       
  }

  iniciarGeolocalizacion(){

/*     this.platform.ready().then(()=>{
      

    }) */

    let options = {timeout: 10000, enableHighAccuracy: true, maximumAge: 3600};

    this.geolocation.getCurrentPosition(options).then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      this.conductor.update({
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
          clave: this._usuarioProv.clave
      });

      this.watch = this.geolocation.watchPosition()
                  .subscribe((data) => {
                   // data can be a set of coordinates, or an error (if an error occurred).
                   // data.coords.latitude
                   this.conductor.update({
                    lat: data.coords.latitude,
                    lng: data.coords.longitude,
                    clave: this._usuarioProv.clave
                });
      });

     }).catch((error) => {
       console.log('Error getting location', JSON.stringify(error));
     });
     
  }

  detenerGeolocalizacion(){
    try {
      this.watch.unsubscribe();
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

}
