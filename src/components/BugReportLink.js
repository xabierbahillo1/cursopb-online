export const BugReportLink = () => {
    const getBugReportMailto = () => {
        const emailAddress = process.env.REACT_APP_SUPPORT_EMAIL; 

        const subject = `[BUG] Reporte de Problema en el Curso`;
        
        const body = `Por favor, explica aquí tu problema:`;
        
        if (!emailAddress) {
            console.error("REACT_APP_SUPPORT_EMAIL no está configurada.");
            return '#';
        }

        return `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    return (
        <a 
            href={getBugReportMailto()}
            className="bug-report-link"
            title="Envíanos un correo con los detalles del problema"
            target="_blank" 
            rel="noopener noreferrer"
        >
            ¿Reportar un problema?
        </a>
    );
};