import {ParsedCTRRecord} from './records';

export type TransferState = "NOT STARTED" | "STARTED" | "ACCEPTED" | "REJECTED" | "DISPUTED";

export interface ConsignmentItem {

}

export interface PlatformUser {
  platform: string;
  name: string;
}

export interface EBL {
  transportDocumentReference: string;
  carrierCode: string;
  consignmentItems: ConsignmentItem[];
  transports: {
    plannedDepartureDate: string;
    plannedArrivalDate: string;
    portOfLoading: {
      UNLocationCode: string;
    }
    portOfDischarge: {
      UNLocationCode: string;
    }
    vesselVoyage: {
      vesselName: string;
      carrierExportVoyageNumber: string;
    }[]
  }
}

export const EBLS = {
  mscEbl: {
    "transportDocumentReference": "62CD536BA8D34C469AFD",
    "shippingInstructionsReference": "fc5009a7-25ad-4bb0-9892-4e2dea6bcdd9",
    "transportDocumentStatus": "ISSUED",
    "transportDocumentTypeCode": "BOL",
    "isShippedOnBoardType": true,
    "freightPaymentTermCode": "PRE",
    "isElectronic": true,
    "isToOrder": true,
    "shippedOnBoardDate": "2023-12-20",
    "termsAndConditions": "You agree that this transport document exist is name only for the sake of\ntesting your conformance with the DCSA EBL API. This transport document is NOT backed\nby a real shipment with ANY carrier and NONE of the requested services will be\ncarried out in real life.\n\nUnless required by applicable law or agreed to in writing, DCSA provides\nthis JSON data on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF\nANY KIND, either express or implied, including, without limitation, any\nwarranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY,\nor FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for\ndetermining the appropriateness of using or redistributing this JSON\ndata and assume any risks associated with Your usage of this data.\n\nIn no event and under no legal theory, whether in tort (including negligence),\ncontract, or otherwise, unless required by applicable law (such as deliberate\nand grossly negligent acts) or agreed to in writing, shall DCSA be liable to\nYou for damages, including any direct, indirect, special, incidental, or\nconsequential damages of any character arising as a result of this terms or conditions\nor out of the use or inability to use the provided JSON data (including but not limited\nto damages for loss of goodwill, work stoppage, computer failure or malfunction, or any\nand all other commercial damages or losses), even if DCSA has been advised of the\npossibility of such damages.\n",
    "receiptTypeAtOrigin": "CY",
    "deliveryTypeAtDestination": "CY",
    "cargoMovementTypeAtOrigin": "FCL",
    "cargoMovementTypeAtDestination": "FCL",
    "serviceContractReference": "SCR-1234-REGULAR",
    "carrierCode": "MSC",
    "carrierCodeListProvider": "SMDG",
    "issuingParty": {
      "partyName": "Mediterranean Shipping Company",
      "address": {
        "street": "Chemin Rieu",
        "streetNumber": "12-14",
        "city": "Geneva",
        "countryCode": "CH"
      },
      "identifyingCodes": [
        {
          "codeListProvider": "SMDG",
          "codeListName": "LCL",
          "partyCode": "MSC"
        }
      ]
    },
    "transports": {
      "plannedDepartureDate": "2023-12-20",
      "plannedArrivalDate": "2023-12-22",
      "portOfLoading": {
        "locationType": "UNCO",
        "UNLocationCode": "DKAAR"
      },
      "portOfDischarge": {
        "locationType": "UNLO",
        "UNLocationCode": "DEBRV"
      },
      "vesselVoyage": [
        {
          "vesselName": "MSC Gülsün",
          "carrierExportVoyageNumber": "402E"
        }
      ]
    },
    "charges": [
      {
        "chargeName": "Fictive transport document fee",
        "currencyAmount": 1,
        "currencyCode": "EUR",
        "paymentTermCode": "COL",
        "calculationBasis": "Per transport document",
        "unitPrice": 1,
        "quantity": 1
      }
    ],
    "invoicePayableAt": {
      "UNLocationCode": "DKAAR"
    },
    "partyContactDetails": [
      {
        "name": "DCSA test person",
        "email": "no-reply@dcsa.example.org"
      }
    ],
    "documentParties": {
      "shipper": {
        "partyName": "DCSA CTK",
        "displayedAddress": [
          "Strawinskylaan 4117"
        ],
        "partyContactDetails": [
          {
            "name": "DCSA test person",
            "email": "no-reply@dcsa.example.org"
          }
        ]
      }
    },
    "consignmentItems": [
      {
        "carrierBookingReference": "CBR_123_REGULAR",
        "descriptionOfGoods": "Shoes - black",
        "HSCodes": [
          "640510"
        ],
        "cargoItems": [
          {
            "equipmentReference": "NARU3472484",
            "weight": 12000,
            "weightUnit": "KGM",
            "outerPackaging": {
              "numberOfPackages": 400,
              "packageCode": "4G",
              "description": "Fibreboard boxes"
            }
          }
        ]
      }
    ],
    "utilizedTransportEquipments": [
      {
        "isShipperOwned": false,
        "seals": [
          {
            "number": "DCSA-CTK-1234"
          }
        ],
        "equipment": {
          "ISOEquipmentCode": "22G1",
          "equipmentReference": "NARU3472484"
        }
      }
    ]
  } as EBL,
} as const;

let _transferCounts: number = 0;

export function nextTransferID() {
  return ++_transferCounts;
}

export interface PlatformTransfer {
  transferID: number;
  fromPlatform: PlatformState;
  toPlatform: PlatformState;
  ctrRecord: ParsedCTRRecord;
}

export class PlatformState {
  receiver?: PlatformState;
  transferState: TransferState = "NOT STARTED";
  incomingTransfers: PlatformTransfer[] = [];

  constructor(readonly platform: string, readonly name: string) {
  }

  public get isTransferInProgress(): boolean {
    return this.transferState === "STARTED"
  }

  public get isTransferAccepted(): boolean {
    return this.transferState === "ACCEPTED"
  }

  public get isTransferRejected(): boolean {
    return this.transferState === "REJECTED"
  }

  public get isTransferDisputed(): boolean {
    return this.transferState === "DISPUTED"
  }

  public get isTransferComplete(): boolean {
    return this.transferState !== "NOT STARTED" && this.transferState !== "STARTED";
  }

  public get hasTransferStarted(): boolean {
    return this.transferState !== "NOT STARTED"
  }
}
