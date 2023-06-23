import { Component, AfterViewInit } from '@angular/core';
import { SettingService } from '../../../services/administration/setting.service';
import { ISetting } from '../../../models/administration/setting.model';
import { IOffice } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';

declare var google:any;
declare var jQuery:any;
import { Observable, forkJoin } from 'rxjs';
import { OnLoadedChange } from '../../../services/utils/util.service';

@Component({
    styles: [``],
    selector: 'contact',
    templateUrl: './contact.component.html',
    providers: [ SettingService, OfficeService ]
})
export class ContactComponent implements AfterViewInit {
	public setting:ISetting;
	public offices:Array<IOffice> = [];
    constructor(
        public settingService: SettingService,
        public officeService: OfficeService
    ) {
    }

    ngAfterViewInit(){
        if((OnLoadedChange as any)['completed']){
            	this.load();
        }else{
            OnLoadedChange.subscribe( () =>{
            	this.load();
            })
        }
    }
    load(){
		let requests = [];
		requests.push( this.settingService.current());
		requests.push(this.officeService.unauthorizad_filter({
			fields: {
				'description': true,
				'name': true,
				'latitude': true,
				'longitude': true
			}
		}));
		forkJoin(requests).subscribe( (responses:any)=>{
			this.setting = <ISetting>responses[0].setting;
			this.offices = <Array<IOffice>>responses[1].docs;
            this.phones = this.setting.phone.split('/');
            this.initialize();
        })
    }

    public marker:any[] = [];
    public infowindow:any[] = [];
    public map:any;
    public image:string = '';
    public phones:string[] = [];
	addMarker(location:any , name:any, contentstr:any){
        this.marker[name] = new google.maps.Marker({
            position: location,
			map: this.map,
			icon: this.image
        });
        this.marker[name].setMap(this.map);

		this.infowindow[name] = new google.maps.InfoWindow({
			content:contentstr
		});
		
		google.maps.event.addListener(this.marker[name], 'click', () => {
			this.infowindow[name].open(this.map, this.marker[name]);
		});
    }
	
	initialize() {
		var lat = '19.233719';
		var lng = '-69.619235';
		var mapStyle = jQuery('#map-canvas').attr("data-style");

		var myLatlng = new google.maps.LatLng(lat,lng);

		var setZoom = parseInt(jQuery('#map-canvas').attr("data-zoom"));

		var styles:any = "";

		if (mapStyle=="1"){
			styles = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];
			this.image = 'assets/images/map-marker.png';
		}
		var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});
		var mapOptions = {
			zoom: 8,
			disableDefaultUI: false,
			scrollwheel: false,
			zoomControl: true,
			streetViewControl: true,
			center: myLatlng
		};
		this.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
		this.offices.forEach( (office:IOffice, index:number) =>{
			var this_index = jQuery('.addresses-block a').index(this);
			var mark_name = 'template_marker_'+ index;
			var mark_locat = new google.maps.LatLng(office.latitude, office.longitude);
			let context = `<div id="content">
				<h5>${office.name}</h5>
				<p>${office.description}</p>
			</div>`
			this.addMarker(mark_locat, mark_name, context);	
		})
	}
}