import { Injectable } from "@angular/core";
import axios, { AxiosInstance } from 'axios';
import {disableInterface, UpdateJsonFormValue} from "./app.interface";


@Injectable({
  providedIn: "root",
})
export class ApiService {
  revisedPremium:any;
  secretKeyConfig={ };
  tokenFromUI = "93389a26699r89k3";
  encrypted:any;
    private apiUrl = 'http://localhost:3000';
  private axios: AxiosInstance;
  constructor() {
    this.axios = axios.create({
      baseURL:this.apiUrl,
    });
  }


  async getApiCall(url: string, params?: any): Promise<any> {
    try {
      let response = await this.axios.get(`${this.apiUrl}/${url}`);
      return response["data"];
    } catch (exception:any) {
            throw exception;
    }
  }

  async postApiCall(url: string, params: any): Promise<any> {
    try {
      let response = await this.axios.post(url, params);
      return response['data'];
    } catch (exception: any) {
      throw exception;
    }
  }

  async putApiCall(url: string, params: UpdateJsonFormValue | disableInterface): Promise<any> {
    try {
      let response = await this.axios.put(url, params);
      return response['data'];
    } catch (exception: any) {
      throw exception;
    }
  }

  async deleteApiCall(url: string): Promise<any> {
    try {
      let response = await this.axios.delete(url);
      return response['data'];
    } catch (exception: any) {
      throw exception;
    }
  }

}
