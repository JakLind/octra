import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService, ModalOptions} from 'ngx-bootstrap';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css']
})
export class ErrorModalComponent implements OnInit {
  modalRef: BsModalRef;
  config: ModalOptions = {
    keyboard: false,
    backdrop: false,
    ignoreBackdropClick: false
  };
  @ViewChild('modal') modal: TemplateRef<any>;
  protected data = {
    text: ''
  };
  private actionperformed: Subject<void> = new Subject<void>();

  constructor(private modalService: BsModalService) {
  }

  ngOnInit() {
  }

  public open(data: {
    text: string
  }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (data.hasOwnProperty('text')) {
        this.data.text = data.text;
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
      } else {
        reject('error modal needs data.text property');
      }
    });
  }

  public close(action: void) {
    this.modalRef.hide();
    this.actionperformed.next(action);
  }
}
