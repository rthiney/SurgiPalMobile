
export class UserData {
      id?: string;
      createdAt?: string;
      updatedAt?: string;
      version?: string;
      deleted?: boolean;
      name?: string;
      picture?: string;
      email?: string;
      tag?: string;
      userId?: string;
      hasSeenTutorial?: boolean;
      fos_id?: number
      constructor(_name: string, _picture: string, _email: string, _tag: string, _userId: string, _hasSeenTutorial: boolean, _fos: number) { 
            this.name = _name;
            this.picture = _picture;
            this.email = _email;
            this.tag = _tag;
            this.userId = _userId;
            this.hasSeenTutorial = _hasSeenTutorial;
            this.hasSeenTutorial = _hasSeenTutorial;
            this.fos_id = _fos;
      }
}