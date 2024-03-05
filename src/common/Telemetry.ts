import TelemetryClient from "applicationinsights/out/Library/TelemetryClient";
import Context from "../blob/generated/Context";
import {Operation as BlobOperation} from "../blob/generated/artifacts/operation";
//import {Operation as QueueOperation} from "../queue/generated/artifacts/operation";
//import {Operation as TableOperation} from "../table/generated/artifacts/operation";

export class AzuriteTelemetryClient {
  private static defaultClient : TelemetryClient | undefined;

  private static enableTelemetry: boolean = true;
  //private _totalSize: number = 0;

  public static init(enableTelemetry?: boolean) {
    
   
    if (enableTelemetry !== undefined)
    {
      AzuriteTelemetryClient.enableTelemetry = enableTelemetry;
    }
    if (AzuriteTelemetryClient.enableTelemetry && AzuriteTelemetryClient.defaultClient === undefined)
    {
      let appInsights = require('applicationinsights');

      // disable default logging
      var appConfig = appInsights.setup('InstrumentationKey=28f7cfab-c2b3-44bf-b880-8af2d41f1783;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/')
        .setAutoCollectRequests(false)
        .setAutoCollectPerformance(false)
        .setAutoCollectExceptions(false)
        .setAutoCollectDependencies(false)
        .setAutoCollectConsole(false);
        
        AzuriteTelemetryClient.defaultClient = appInsights.defaultClient;
      if (AzuriteTelemetryClient.defaultClient !== undefined)
      {
        AzuriteTelemetryClient.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "AzuriteTest";
      }
    
      // For development only, make  your telemetry to be sent as soon as it's collected.
      appConfig.setInternalLogging(true, true);
      appInsights.defaultClient.config.maxBatchSize = 0;
    
      appInsights.start();
    }
  }

  public static TraceRequest(context: Context) {
    if (AzuriteTelemetryClient.enableTelemetry && AzuriteTelemetryClient.defaultClient !== undefined)
    {
      AzuriteTelemetryClient.defaultClient.trackRequest(
        {
          name:BlobOperation[context.operation??0], 
          url:AzuriteTelemetryClient.GetRequestUri(context), 
          duration:context.startTime?((new Date()).getTime() - context.startTime?.getTime()):0, 
          resultCode:context.response?.getStatusCode()??0, 
          success:true, 
          id: context.contextId,
          properties: 
            {
              userAgent: context.request?.getHeader("user-agent"),
              apiVersion: context.request?.getHeader("x-ms-version"),
              authorization: context.request?.getHeader("authorization")?.split(" ")[0],
            }
        });
    }
  }

  public static TraceStartEvent() {
    if (AzuriteTelemetryClient.enableTelemetry && AzuriteTelemetryClient.defaultClient !== undefined)
    {
      // TODO: record Azurite instance ID (GUID) in customProperty, to get how many Azurite instance are installed.
      AzuriteTelemetryClient.defaultClient.trackEvent({name: "Azurite Start event", properties: {customProperty: "custom property value"}});
    }
  }

  public static TraceStopEvent() {
    if (AzuriteTelemetryClient.enableTelemetry && AzuriteTelemetryClient.defaultClient !== undefined)
    {
      AzuriteTelemetryClient.defaultClient.trackEvent({name: "Azurite Start event", properties: {customProperty: "custom property value"}});
    }
  }

  private static GetRequestUri(context: Context): string {
    if (context.request !== undefined)
    {
      let request = context.request;
      let requestUri = request.getUrl();
      let sig = request.getQuery("sig");
      if (sig!=undefined)
      {
        requestUri = requestUri.replace(encodeURIComponent(sig), "[hidden]");
      }
    return `${request.getProtocol()}:\\${requestUri}`;
    }
    return "";
  }
}