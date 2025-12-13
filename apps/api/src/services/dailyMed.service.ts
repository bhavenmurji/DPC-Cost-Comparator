/**
 * DailyMed API Service
 *
 * FREE government API from NIH National Library of Medicine
 * Provides drug information, labels, NDC codes (but NOT pricing)
 *
 * API Docs: https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm
 * Base URL: https://dailymed.nlm.nih.gov/dailymed/services/v2
 *
 * NO API KEY REQUIRED - This is free to use!
 */

import axios from 'axios'

const BASE_URL = 'https://dailymed.nlm.nih.gov/dailymed/services/v2'

export interface DrugName {
  drugName: string
}

export interface DrugNDC {
  ndcCode: string
  productNdc: string
  packageNdc: string
}

export interface DrugSPL {
  setid: string
  title: string
  published_date: string
}

export interface DrugClass {
  code: string
  name: string
}

class DailyMedService {
  /**
   * Search for drug names
   * Useful for autocomplete/drug lookup
   */
  async searchDrugNames(query: string, limit: number = 10): Promise<string[]> {
    try {
      const response = await axios.get(`${BASE_URL}/drugnames.json`, {
        params: {
          drug_name: query,
          pagesize: limit,
        },
      })

      return response.data.data?.map((d: any) => d.drug_name) || []
    } catch (error) {
      console.error('DailyMed drug name search error:', error)
      return []
    }
  }

  /**
   * Get NDC codes for a drug
   * NDC = National Drug Code (unique identifier)
   */
  async getNDCsByDrugName(drugName: string): Promise<string[]> {
    try {
      const response = await axios.get(`${BASE_URL}/ndcs.json`, {
        params: {
          drug_name: drugName,
        },
      })

      return response.data.data?.map((d: any) => d.ndc) || []
    } catch (error) {
      console.error('DailyMed NDC lookup error:', error)
      return []
    }
  }

  /**
   * Get drug label/SPL information
   * Returns structured product labeling data
   */
  async getDrugLabels(drugName: string, limit: number = 10): Promise<DrugSPL[]> {
    try {
      const response = await axios.get(`${BASE_URL}/spls.json`, {
        params: {
          drug_name: drugName,
          pagesize: limit,
        },
      })

      return response.data.data || []
    } catch (error) {
      console.error('DailyMed SPL lookup error:', error)
      return []
    }
  }

  /**
   * Get drug class information
   * Returns pharmacologic class (what the drug does)
   */
  async getDrugClasses(): Promise<DrugClass[]> {
    try {
      const response = await axios.get(`${BASE_URL}/drugclasses.json`)
      return response.data.data || []
    } catch (error) {
      console.error('DailyMed drug classes error:', error)
      return []
    }
  }

  /**
   * Get detailed label by SET ID
   */
  async getLabelBySetId(setId: string): Promise<any> {
    try {
      const response = await axios.get(`${BASE_URL}/spls/${setId}.json`)
      return response.data.data || null
    } catch (error) {
      console.error('DailyMed label lookup error:', error)
      return null
    }
  }

  /**
   * Get all NDC codes for a specific label
   */
  async getNDCsBySetId(setId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${BASE_URL}/spls/${setId}/ndcs.json`)
      return response.data.data?.map((d: any) => d.ndc) || []
    } catch (error) {
      console.error('DailyMed NDC by SetId error:', error)
      return []
    }
  }

  /**
   * Validate a drug name exists
   */
  async validateDrugName(drugName: string): Promise<boolean> {
    const results = await this.searchDrugNames(drugName, 1)
    return results.length > 0
  }

  /**
   * Get download URL for drug label PDF
   */
  getLabelPdfUrl(setId: string): string {
    return `https://dailymed.nlm.nih.gov/dailymed/downloadpdffile.cfm?setId=${setId}`
  }

  /**
   * Get download URL for drug label ZIP
   */
  getLabelZipUrl(setId: string): string {
    return `https://dailymed.nlm.nih.gov/dailymed/downloadzipfile.cfm?setId=${setId}`
  }
}

export const dailyMedService = new DailyMedService()
