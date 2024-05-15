import {Injectable} from '@angular/core';
import {Observable, of, tap, throwError} from 'rxjs';
import {ParsedCTRRecord, PlatformRecord} from '../models/records';
import shajs from 'sha.js';
import {v4 as uuidv4} from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class CtrService {

  private state: Map<string, ParsedCTRRecord[]> = new Map();
  private records: Map<string, ParsedCTRRecord> = new Map();

  constructor() {}

  private requiredRecord(eblID: string, recordID: string): ParsedCTRRecord {
    const record = this.records.get(recordID);
    if (!record || record.parsedPlatformRecord.eblID !== eblID) {
      throw Error("Unknown record or the record is not valid for this eBL");
    }
    return record;
  }

  postRecord(record: PlatformRecord): Observable<ParsedCTRRecord> {
    const eblID = record.eblID
    const previousRecord = record.previousRecord ? this.records.get(record.previousRecord) : undefined;
    let inResponseToRecord;
    let canonicalRecord;
    try {
      inResponseToRecord = record.inResponseToRecord ? this.requiredRecord(eblID, record.inResponseToRecord) : undefined;
      canonicalRecord = record.canonicalRecord ? this.requiredRecord(eblID, record.canonicalRecord) : undefined;
    } catch (e) {
      return throwError(() => e);
    }
    const existingRecords = this.state.get(eblID);
    let recordNumber = 1;
    if (!existingRecords) {
      if (record.previousRecord) {
        return throwError(() => Error("Conflict: Bad previous previousRecord"));
      }
    } else if (existingRecords && !record.previousRecord) {
      return throwError(() => Error("Conflict: Bad previous previousRecord"));
    } else if (existingRecords[existingRecords.length - 1].recordID !== record.previousRecord) {
      return throwError(() => Error("Conflict: Bad previous previousRecord"));
    } else {
      recordNumber = existingRecords[existingRecords.length - 1].recordNumber + 1;
    }
    const sha256HashFunc = shajs('sha256');
    // TODO: Create a proper signed record and checksum it, so the record ID is correct.
    // - for now a UUID is used as a placeholder.
    const recordID = sha256HashFunc.update(uuidv4()).digest('hex');
    let parsedCTRRecord: ParsedCTRRecord = {
      recordID: recordID,
      recordNumber,
      insertedAtTimestamp: new Date(),
      insertedBy: record.actor,
      parsedPlatformRecord: {
        eblID,
        action: record.action,
        actor: record.actor,
        receiver: record.receiver,
        platformActionTimestamp: new Date(record.platformActionTimestamp),
        lastEnvelopeTransferChainEntrySignedContentChecksum: record.lastEnvelopeTransferChainEntrySignedContentChecksum,
        inResponseToRecord,
        canonicalRecord,
        previousRecord,
      }
    }
    // Use an observable to ensure nothing happens unless someone subscribes
    // (to closer match how the service will work with proper API integration)
    return of(parsedCTRRecord).pipe(
      tap(record => {
        if (!existingRecords) {
          this.state.set(eblID, [record]);
        } else  {
          existingRecords.push(record);
        }
        this.records.set(record.recordID, record);
        console.log(this.state)
      })
    );
  }

  getRecordsForEBL(eblID: string): Observable<ParsedCTRRecord[]> {
    let v = this.state.get(eblID);
    console.log(`Fetching state for ${eblID}`)
    if (!v) {
      console.log(`No eBL with that ID:`, this.state)
      v = [];
    }
    return of(v);
  }
}
