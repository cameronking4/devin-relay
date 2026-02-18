import { randomUUID } from "crypto";

/**
 * Typeform Webhooks - single event type: form_response
 * Payload: event_id, event_type, form_response (form_id, token, response_url, submitted_at, landed_at, definition, answers, ending)
 * Header: Typeform-Signature (sha256=base64(hmac-sha256(payload, secret)))
 * @see https://www.typeform.com/developers/webhooks/
 * @see https://www.typeform.com/developers/webhooks/example-payload/
 */
export function generateTypeformPayload(_eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const eventId = randomUUID().replace(/-/g, "").slice(0, 9);
  const formId = randomUUID().replace(/-/g, "").slice(0, 6);
  const token = randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();
  const landedAt = new Date(Date.now() - 60000).toISOString(); // 1 min before submit

  const payload = {
    event_id: eventId,
    event_type: "form_response",
    form_response: {
      form_id: formId,
      token,
      response_url: `https://admin.typeform.com/form/${formId}/results?responseId=${token}#responses`,
      submitted_at: now,
      landed_at: landedAt,
      calculated: { score: Math.floor(3 + Math.random() * 5) },
      variables: [
        { key: "score", type: "number", number: 4 },
        { key: "name", type: "text", text: "Jane Doe" },
      ],
      hidden: { user_id: "usr_abc123" },
      definition: {
        id: formId,
        title: "Product Feedback Survey",
        fields: [
          {
            id: "DlXFaesGBpoF",
            title: "What did you think of our product?",
            type: "long_text",
            ref: "feedback_text",
            allow_multiple_selections: false,
            allow_other_choice: false,
          },
          {
            id: "SMEUb7VJz92Q",
            title: "What's your email address?",
            type: "email",
            ref: "email_field",
            allow_multiple_selections: false,
            allow_other_choice: false,
          },
          {
            id: "JwWggjAKtOkA",
            title: "How would you rate us? (1-5)",
            type: "rating",
            ref: "rating_field",
            allow_multiple_selections: false,
            allow_other_choice: false,
          },
        ],
        endings: [
          {
            id: "dN5FLyFpCMFo",
            ref: randomUUID().replace(/-/g, "").slice(0, 26),
            title: "Thank you!",
            type: "thankyou_screen",
            properties: { button_text: "Submit", show_button: false, share_icons: false },
          },
        ],
      },
      answers: [
        {
          type: "text",
          text: "Great experience, the onboarding was smooth and the UI is intuitive.",
          answer_url: `https://admin.typeform.com/form/${formId}/results?responseId=${token}&fieldId=DlXFaesGBpoF#responses`,
          field: { id: "DlXFaesGBpoF", type: "long_text" },
        },
        {
          type: "email",
          email: "jane.doe@example.com",
          answer_url: `https://admin.typeform.com/form/${formId}/results?responseId=${token}&fieldId=SMEUb7VJz92Q#responses`,
          field: { id: "SMEUb7VJz92Q", type: "email" },
        },
        {
          type: "number",
          number: 5,
          answer_url: `https://admin.typeform.com/form/${formId}/results?responseId=${token}&fieldId=JwWggjAKtOkA#responses`,
          field: { id: "JwWggjAKtOkA", type: "rating" },
        },
      ],
      ending: {
        id: "dN5FLyFpCMFo",
        ref: randomUUID().replace(/-/g, "").slice(0, 26),
      },
    },
  };

  return {
    payload,
    headers: {
      "Content-Type": "application/json",
      "Typeform-Signature": "sha256=placeholder-signature",
    },
  };
}
