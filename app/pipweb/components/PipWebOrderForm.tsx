"use client";

import {
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import {
  PIPWEB_PACKAGE_LABEL,
  buildPipWebWhatsAppUrl,
} from "@/app/pipweb/config";
import {
  PIPWEB_TEMPLATE_PARAM,
  PIPWEB_TEMPLATES,
  getPipWebTemplateById,
  getSelectedPipWebTemplate,
  setSelectedPipWebTemplate,
} from "@/app/pipweb/data/templates";

const NOT_SELECTED = "";

const FIELD =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-[#07111F] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#60A5FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]";

const FIELD_ERROR = "border-red-400/70 focus:border-red-400";

type FormState = {
  businessName: string;
  customerName: string;
  email: string;
  phone: string;
  businessType: string;
  hasDomain: "" | "yes" | "no";
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = {
  businessName: "",
  customerName: "",
  email: "",
  phone: "",
  businessType: "",
  hasDomain: "",
  message: "",
};

function getStoredTemplateId(): string {
  const stored = getSelectedPipWebTemplate();
  if (stored && getPipWebTemplateById(stored.id)) return stored.id;
  return NOT_SELECTED;
}

function useStoredTemplateId() {
  return useSyncExternalStore(
    () => () => undefined,
    getStoredTemplateId,
    () => NOT_SELECTED
  );
}

function templateLabel(templateId: string): string {
  return getPipWebTemplateById(templateId)?.name ?? "Not selected";
}

function domainLabel(hasDomain: FormState["hasDomain"]): string {
  if (hasDomain === "yes") return "Yes";
  if (hasDomain === "no") return "No";
  return "Not specified";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildWhatsAppMessage(values: FormState & { templateId: string }): string {
  return [
    "PipWeb Studio Website Request",
    "",
    `Business Name: ${values.businessName.trim()}`,
    `Customer Name: ${values.customerName.trim()}`,
    `Email: ${values.email.trim() || "Not provided"}`,
    `Phone: ${values.phone.trim()}`,
    `Business Type: ${values.businessType.trim()}`,
    `Selected Template: ${templateLabel(values.templateId)}`,
    `Existing Domain: ${domainLabel(values.hasDomain)}`,
    `Message: ${values.message.trim() || "Not provided"}`,
    "",
    "Package:",
    PIPWEB_PACKAGE_LABEL,
  ].join("\n");
}

export default function PipWebOrderForm() {
  const formId = useId();
  const searchParams = useSearchParams();
  const urlTemplate = searchParams.get(PIPWEB_TEMPLATE_PARAM);
  const urlTemplateId = getPipWebTemplateById(urlTemplate)?.id ?? NOT_SELECTED;
  const storedTemplateId = useStoredTemplateId();
  const [manualTemplateId, setManualTemplateId] = useState<string | null>(null);
  const [urlSynced, setUrlSynced] = useState(urlTemplate);
  const [values, setValues] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  if (urlTemplate !== urlSynced) {
    setUrlSynced(urlTemplate);
    setManualTemplateId(null);
  }

  const templateId =
    manualTemplateId !== null
      ? manualTemplateId
      : urlTemplateId || storedTemplateId;

  const ids = useMemo(
    () => ({
      businessName: `${formId}-business-name`,
      customerName: `${formId}-customer-name`,
      email: `${formId}-email`,
      phone: `${formId}-phone`,
      businessType: `${formId}-business-type`,
      template: `${formId}-template`,
      domain: `${formId}-domain`,
      message: `${formId}-message`,
    }),
    [formId]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = (nextValues: FormState): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!nextValues.businessName.trim()) {
      nextErrors.businessName = "Enter your business name.";
    }
    if (!nextValues.customerName.trim()) {
      nextErrors.customerName = "Enter your name.";
    }
    if (nextValues.email.trim() && !isValidEmail(nextValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!nextValues.phone.trim()) {
      nextErrors.phone = "Enter a phone or WhatsApp number.";
    }
    if (!nextValues.businessType.trim()) {
      nextErrors.businessType = "Enter your business type.";
    }
    return nextErrors;
  };

  const onTemplateChange = (nextTemplateId: string) => {
    setManualTemplateId(nextTemplateId);
    const template = getPipWebTemplateById(nextTemplateId);
    if (template) {
      setSelectedPipWebTemplate({ id: template.id, name: template.name });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitted(true);

    const firstError = (
      Object.keys(nextErrors) as Array<keyof FormState>
    ).find((key) => nextErrors[key]);
    if (firstError) {
      const focusId =
        firstError === "hasDomain" ? `${ids.domain}-yes` : ids[firstError];
      document.getElementById(focusId)?.focus();
      return;
    }

    const whatsappUrl = buildPipWebWhatsAppUrl(
      buildWhatsAppMessage({ ...values, templateId })
    );
    const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(whatsappUrl);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-white/10 bg-[#0F172A] p-5 sm:p-7"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id={ids.businessName}
          label="Business Name"
          value={values.businessName}
          onChange={(value) => update("businessName", value)}
          placeholder="e.g. Sunrise Cafe"
          error={errors.businessName}
          required
        />
        <Field
          id={ids.customerName}
          label="Customer Name"
          value={values.customerName}
          onChange={(value) => update("customerName", value)}
          placeholder="Your full name"
          error={errors.customerName}
          required
        />
        <Field
          id={ids.email}
          label="Email"
          type="email"
          value={values.email}
          onChange={(value) => update("email", value)}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <Field
          id={ids.phone}
          label="Phone / WhatsApp"
          type="tel"
          value={values.phone}
          onChange={(value) => update("phone", value)}
          placeholder="Include country code"
          error={errors.phone}
          required
          autoComplete="tel"
        />
        <Field
          id={ids.businessType}
          label="Business Type"
          value={values.businessType}
          onChange={(value) => update("businessType", value)}
          placeholder="e.g. Restaurant, salon, real estate"
          error={errors.businessType}
          required
          className="sm:col-span-2"
        />

        <div className="sm:col-span-2">
          <label htmlFor={ids.template} className="text-sm font-medium text-slate-200">
            Selected Template
          </label>
          <select
            id={ids.template}
            name="template"
            value={templateId}
            onChange={(event) => onTemplateChange(event.target.value)}
            className={FIELD}
          >
            <option value={NOT_SELECTED}>Not selected</option>
            {PIPWEB_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-slate-200">
            Do You Already Have a Domain?
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#07111F] px-4 py-2.5 text-sm text-white">
              <input
                id={`${ids.domain}-yes`}
                type="radio"
                name="hasDomain"
                value="yes"
                checked={values.hasDomain === "yes"}
                onChange={() => update("hasDomain", "yes")}
                className="accent-[#3B82F6]"
              />
              Yes
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#07111F] px-4 py-2.5 text-sm text-white">
              <input
                id={`${ids.domain}-no`}
                type="radio"
                name="hasDomain"
                value="no"
                checked={values.hasDomain === "no"}
                onChange={() => update("hasDomain", "no")}
                className="accent-[#3B82F6]"
              />
              No
            </label>
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label htmlFor={ids.message} className="text-sm font-medium text-slate-200">
            Message
          </label>
          <textarea
            id={ids.message}
            name="message"
            rows={4}
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            placeholder="Tell us anything we should know about your business or website."
            className={`${FIELD} resize-y min-h-[6.5rem]`}
          />
        </div>
      </div>

      {submitted && Object.keys(errors).length > 0 ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          Please fix the highlighted fields before sending your request.
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.30)] transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
      >
        <FaWhatsapp className="text-lg" aria-hidden />
        Request My Website
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  type = "text",
  autoComplete,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
        {required ? (
          <span className="text-[#7DD3FC]" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${FIELD} ${error ? FIELD_ERROR : ""}`}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
