import { Component } from '@angular/core';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { filter } from 'rxjs/operators'
@Component({
  selector: 'app-root',
  template: `
  <div class="container">
    <nz-upload
      [nzAccept]="'application/vnd.openxmlformats-officedocument.wordprocessingml.document'"
      nzType="drag"
      [nzBeforeUpload]="beforeUpload"
      [nzName]="'book'"
      [nzMultiple]="false"
      [nzLimit]="1"
      [nzSize]="1024"
      nzAction="#"
      [(nzFileList)]="fileList"
    >
    <p class="ant-upload-drag-icon">
    <i nz-icon nzType="inbox"></i>
    </p>
    <p class="ant-upload-text">Click or drag file to this area to upload your book</p>
    <p class="ant-upload-hint">Accepted format: .docx file only</p>
    </nz-upload>
  </div>
  `,
  styles: [`.container{width: 500px; margin: 0 auto;}`]
})
export class AppComponent {
  constructor(private msg: NzMessageService, private http: HttpClient) { }

  fileList: UploadFile[] = [
    {
      uid: '1',
      size: 12345,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'testDummyBook.docx',
      status: 'done',
      url: 'http://localhost:3000/getfile/1565041731999-test.docx'
    }
  ];


  beforeUpload = (file: UploadFile): boolean => {
    if (this.fileList.length) {
      this.msg.error(`Please delete the current book before you upload a new one`);
      return false;
    } else {
      // add initial info to stop double drag-and-drop
      this.fileList = [{
        uid: file.uid,
        size: file.size,
        type: file.type,
        name: file.name,
      }]
      const msg_id = this.msg.loading('Upload in progress..', { nzDuration: 0 }).messageId;
      this.upload(file, msg_id)
      return false;
    }
  };

  upload(file, msg_id) {
    const formData = new FormData();
    formData.append('book', file);


    const req = new HttpRequest('POST', 'http://localhost:3000/upload/', formData, {
      reportProgress: true
    });

    this.http
      .request(req)
      .pipe(
        filter(e => e instanceof HttpResponse)
      )
      .subscribe(
        (response) => {
          this.fileList = [{
            uid: '1',
            size: response['body'].size,
            type: response['body'].mimetype,
            name: response['body'].originalname,
            status: 'done',
            url: `http://localhost:3000/getfile/${response['body'].filename}`
          }];
          this.msg.remove(msg_id);
          this.msg.success(`Your book "${file.name}" has been uploaded successfully.`);
        },
        (response) => {
          this.fileList = [];
          this.msg.remove(msg_id);
          this.msg.error(`${file.name} file upload failed. Please choose correct file type and try again.`);
        }
      );
  }
}
