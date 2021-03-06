import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService, ModalOptions} from 'ngx-bootstrap';
import {Subject} from 'rxjs/Subject';

export enum ModalSendAnswer {
  CANCEL = 'CANCEL',
  SEND = 'SEND'
}

@Component({
  selector: 'app-transcription-send-modal',
  templateUrl: './transcription-send-modal.component.html',
  styleUrls: ['./transcription-send-modal.component.css']
})

export class TranscriptionSendModalComponent implements OnInit {
  modalRef: BsModalRef;

  config: ModalOptions = {
    keyboard: false,
    backdrop: false,
    ignoreBackdropClick: false
  };

  @ViewChild('modal') modal: TemplateRef<any>;

  private actionperformed: Subject<ModalSendAnswer> = new Subject<ModalSendAnswer>();

  constructor(private modalService: BsModalService) {
  }

  ngOnInit() {
  }

  public open(): Promise<ModalSendAnswer> {
    return new Promise<ModalSendAnswer>((resolve, reject) => {
      this.modalRef = this.modalService.show(this.modal, this.config);
      const subscr = this.actionperformed.subscribe(
        (action) => {
          resolve(action);
          subscr.unsubscribe();
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  public close(action: ModalSendAnswer) {
    this.modalRef.hide();
    this.actionperformed.next(action);
  }
}
