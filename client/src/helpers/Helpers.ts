class Helpers {
    static localhost: string = 'localhost:8000';
    static server: string = '771a43ca0e50.ngrok-free.app';
    static basePath: string = `http://${this.localhost}`;
    static apiUrl: string = `${this.basePath}/api/`;
    static secretKey: string = '3434774438';
    static imageUrl: string = `${this.basePath}/files/`;
}

export default Helpers;