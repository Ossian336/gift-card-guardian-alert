
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert("No gift cards to export!");
    return;
  }

  // Define CSV headers
  const headers = ["ID", "Brand", "Balance (USD)", "Expiration Date", "Notes"];
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        let value = "";
        switch (header) {
          case "ID":
            value = row.id || "";
            break;
          case "Brand":
            value = row.brand || "";
            break;
          case "Balance (USD)":
            value = row.balance?.toFixed(2) || "0.00";
            break;
          case "Expiration Date":
            value = row.expiration_date || "";
            break;
          case "Notes":
            value = row.notes || "";
            break;
          default:
            value = "";
        }
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escapedValue = value.toString().replace(/"/g, '""');
        if (escapedValue.includes(',') || escapedValue.includes('"') || escapedValue.includes('\n')) {
          return `"${escapedValue}"`;
        }
        return escapedValue;
      }).join(",")
    )
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateCSVFilename = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `giftkeeper_export_${year}-${month}-${day}.csv`;
};
