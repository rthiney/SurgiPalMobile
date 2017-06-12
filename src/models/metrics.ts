import { PulseViewModel } from './viewmodels/pulse_model';


export class SurgeryMetrics {
    cards?: Array<string> = [];
    surgeryType?: Array<string> = [];
    cptCodes?: Array<string> = [];
    speciality?: Array<string> = [];
    admissionStatus?: Array<string> = [];
    diagnosisCodes?: Array<string> = [];
    uniqueDiag?: any = [];
    uniqueCpt?: any = [];
    past: number = 0;
    today: number = 0;
    future: number = 0;
}
export class MessageMetrics {
    read?: number = 0;
    unread?: number = 0;
}

export class SurgeryGroup {
    d: string;
    realDate: Date;
    surgeries: PulseViewModel[];
    hide: boolean = false;
    constructor(date: Date) {
        this.d = date.toLocaleDateString();
        this.realDate = date;
        this.surgeries = [];
        this.hide = false;
    }
}
export class SurgeryGroupItem {
    surgery: PulseViewModel;
    cptArray: string[];
    dxArray: string[];
    hide: boolean = false;
    constructor(_surgery: PulseViewModel) {
        this.surgery = _surgery;
        this.cptArray = (_surgery.cpt) ? _surgery.cpt.split(',').filter(w => !!w.trim()).sort() : null,
            this.dxArray = (_surgery.diagnosisCode) ? _surgery.diagnosisCode.split(',').filter(w => !!w.trim()).sort() : null,
            this.hide = false;
    }
}
