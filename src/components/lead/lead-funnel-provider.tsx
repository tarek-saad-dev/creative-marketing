"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  openLeadSessionAction,
  selectLeadPackageAction,
  recordLeadAbandonedAction,
} from "@/server/actions/lead-session.action";

const LeadDialog = dynamic(
  () => import("@/components/lead/lead-dialog").then(mod => mod.LeadDialog),
  { ssr: false }
);

export type LeadFunnelPackageOption = {
  id: string;
  name: string;
  slug: string;
};

export type LeadFunnelServiceOption = {
  id: string;
  nameAr: string;
  slug: string;
};

type OpenOptions = {
  source: string;
  packageId?: string | null;
  isCustom?: boolean;
};

type LeadFunnelContextValue = {
  open: (options: OpenOptions) => void;
  close: () => void;
  isOpen: boolean;
  packages: LeadFunnelPackageOption[];
  services: LeadFunnelServiceOption[];
  hasWhatsApp: boolean;
};

const LeadFunnelContext = createContext<LeadFunnelContextValue | null>(null);

const TOKEN_KEY = "cm_lead_session_token";

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

function readUtm(): Record<string, string | undefined> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
    utmTerm: params.get("utm_term") ?? undefined,
  };
}

type LeadFunnelProviderProps = {
  children: ReactNode;
  packages: LeadFunnelPackageOption[];
  services: LeadFunnelServiceOption[];
  hasWhatsApp: boolean;
};

export function LeadFunnelProvider({
  children,
  packages,
  services,
  hasWhatsApp,
}: LeadFunnelProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [isCustom, setIsCustom] = useState(false);
  const [source, setSource] = useState("website");
  const [formOpenedAt, setFormOpenedAt] = useState(() => Date.now());
  const [stepIndex, setStepIndex] = useState(0);

  const open = useCallback(async (options: OpenOptions) => {
    setSource(options.source);
    setIsCustom(Boolean(options.isCustom));
    setSelectedPackageId(options.packageId ?? null);
    setStepIndex(0);
    setFormOpenedAt(Date.now());
    setIsOpen(true);

    const utm = readUtm();
    const result = await openLeadSessionAction({
      sessionToken: readToken() ?? undefined,
      source: options.source,
      referrer: document.referrer || undefined,
      landingUrl: window.location.href,
      cta: options.source,
      ...utm,
    });

    if (result.ok) {
      writeToken(result.sessionToken);
      setSessionId(result.sessionId);

      if (options.isCustom) {
        await selectLeadPackageAction({
          sessionId: result.sessionId,
          packageId: null,
          isCustom: true,
        });
      } else if (options.packageId) {
        await selectLeadPackageAction({
          sessionId: result.sessionId,
          packageId: options.packageId,
        });
      }
    }
  }, []);

  const close = useCallback(async () => {
    if (sessionId && stepIndex > 0) {
      await recordLeadAbandonedAction({ sessionId, step: `step_${stepIndex}` });
    }
    setIsOpen(false);
  }, [sessionId, stepIndex]);

  const value = useMemo(
    () => ({
      open,
      close,
      isOpen,
      packages,
      services,
      hasWhatsApp,
    }),
    [open, close, isOpen, packages, services, hasWhatsApp]
  );

  return (
    <LeadFunnelContext.Provider value={value}>
      {children}
      {isOpen ? (
        <LeadDialog
          sessionId={sessionId}
          selectedPackageId={selectedPackageId}
          isCustom={isCustom}
          source={source}
          formOpenedAt={formOpenedAt}
          packages={packages}
          services={services}
          hasWhatsApp={hasWhatsApp}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          onClose={close}
        />
      ) : null}
    </LeadFunnelContext.Provider>
  );
}

export function useLeadFunnel() {
  const ctx = useContext(LeadFunnelContext);
  if (!ctx) {
    throw new Error("useLeadFunnel must be used within LeadFunnelProvider");
  }
  return ctx;
}
