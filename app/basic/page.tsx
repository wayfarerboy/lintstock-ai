import Script from 'next/script';

export default function Page() {
  return (
    <Script async
      src="https://ry7ksxlkfpi5l22cnxtrn2sz.agents.do-ai.run/static/chatbot/widget.js"
      data-agent-id="90a3639c-1f79-11f0-bf8f-4e013e2ddde4"
      data-chatbot-id="7h94FdA5fqcqrsTjvUf_BXHdc-95UFeA"
      data-name="Basic chatbot"
      data-primary-color="#031B4E"
      data-secondary-color="#E5E8ED"
      data-button-background-color="#0061EB"
      data-starting-message="Hi. Ask me questions about the reports in my knowledge base."
      data-logo="/static/chatbot/icons/default-agent.svg"
    />
  );
};
