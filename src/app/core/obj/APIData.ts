export class APIData {

  private _id: number;

  get id(): number {
    return this._id;
  }

  private _annotator: string;

  get annotator(): string {
    return this._annotator;
  }

  private _annobegin: string;

  get annobegin(): string {
    return this._annobegin;
  }

  private _annoend: string;

  get annoend(): string {
    return this._annoend;
  }

  private _url: string;

  get url(): string {
    return this._url;
  }

  private _segmentbegin: number;

  get segmentbegin(): number {
    return this._segmentbegin;
  }

  private _segmentend: number;

  get segmentend(): number {
    return this._segmentend;
  }

  private _priority: number;

  get priority(): number {
    return this._priority;
  }

  private _status: string;

  get status(): string {
    return this._status;
  }

  private _project: string;

  get project(): string {
    return this._project;
  }

  private _jobno: number;

  get jobno(): number {
    return this._jobno;
  }

  constructor(id: number,
              annotator: string,
              annobegin: string,
              annoend: string,
              url: string,
              segmentbegin: number,
              segmentend: number,
              priority: number,
              status: string,
              project: string,
              jobno: number) {
    this._id = id;
    this._annotator = annotator;
    this._annobegin = annobegin;
    this._annoend = annoend;
    this._url = url;
    this._segmentbegin = segmentbegin;
    this._segmentend = segmentend;
    this._priority = priority;
    this._status = status;
    this._project = project;
    this._jobno = jobno;
  }
}
