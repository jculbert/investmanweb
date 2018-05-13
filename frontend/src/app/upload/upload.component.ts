import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {BackendService, Transaction} from '../backend.service'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  upload_data: any = {}

  constructor(private backendService: BackendService, private router: Router) { }

  ngOnInit() {
  }

  uploadFile(event): void {
    this.upload_data = {};
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        this.backendService.upload_file(fileList[0]).subscribe(data =>
          {
            this.upload_data = data;
          }
        );
    }
  }
}
