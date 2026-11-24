
let comparisonProducts = [];
let wishlist = JSON.parse(localStorage.getItem("valuewiseWishlist") || "[]");
let signupMode = false;

function evaluateProduct() {
  const name = document.getElementById("productName").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const rating = Number(document.getElementById("productRating").value);
  const warranty = Number(document.getElementById("productWarranty").value);
  const durability = Number(document.getElementById("productDurability").value);
  const market = Number(document.getElementById("marketPrice").value);

  if (!name || price <= 0 || rating < 0 || rating > 5 || warranty < 0 || durability < 0 || durability > 10 || market <= 0) {
    alert("Please enter valid details in all fields.");
    return;
  }

  const priceScore = Math.min(100, (market / price) * 100);
  const ratingScore = (rating / 5) * 100;
  const warrantyScore = Math.min(100, (warranty / 5) * 100);
  const durabilityScore = durability * 10;
  const score = Math.round(priceScore * .30 + ratingScore * .30 + warrantyScore * .15 + durabilityScore * .25);

  let decision = "SKIP";
  let description = "Consider looking for a better alternative.";

  if (score >= 75) {
    decision = "BUY";
    description = "This product offers good overall value.";
  } else if (score >= 55) {
    decision = "WAIT";
    description = "Compare more products before purchasing.";
  }

  const result = document.getElementById("evaluationResult");
  result.classList.remove("hidden");
  result.innerHTML = `
    <h3>${name} – Evaluation Result</h3>
    <div class="result-score">${score}/100</div>
    <h3>${decision} RECOMMENDED</h3>
    <p>${description}</p>
    <p>Price score: ${Math.round(priceScore)} | Rating score: ${Math.round(ratingScore)}</p>
    <p>Warranty score: ${Math.round(warrantyScore)} | Durability score: ${Math.round(durabilityScore)}</p>
    <button class="small-btn" onclick="saveEvaluatedProduct('${safeText(name)}',${price})">Save to Wishlist</button>
  `;
  document.getElementById("heroScore").textContent = score;
}

function safeText(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function addComparison() {
  const name = document.getElementById("compareName").value.trim();
  const price = Number(document.getElementById("comparePrice").value);
  const rating = Number(document.getElementById("compareRating").value);
  const warranty = Number(document.getElementById("compareWarranty").value);
  const durability = Number(document.getElementById("compareDurability").value);

  if (!name || price <= 0 || rating < 0 || rating > 5 || warranty < 0 || durability < 0 || durability > 10) {
    alert("Enter valid product details.");
    return;
  }

  if (comparisonProducts.length >= 4) {
    alert("You can compare up to four products.");
    return;
  }

  comparisonProducts.push({ name, price, rating, warranty, durability });
  renderComparison();
  ["compareName", "comparePrice", "compareRating", "compareWarranty", "compareDurability"].forEach(id => document.getElementById(id).value = "");
}

function renderComparison() {
  const container = document.getElementById("comparisonList");
  container.innerHTML = comparisonProducts.map((p, i) => `
    <div class="product-card">
      <h3>${escapeHTML(p.name)}</h3>
      <p>Price: ₹${p.price.toLocaleString("en-IN")}</p>
      <p>Rating: ${p.rating}/5</p>
      <p>Warranty: ${p.warranty} years</p>
      <p>Durability: ${p.durability}/10</p>
      <button class="small-btn" onclick="removeComparison(${i})">Remove</button>
    </div>
  `).join("");

  if (comparisonProducts.length > 1) {
    const best = [...comparisonProducts].sort((a,b) => {
      const scoreA = a.rating * 20 + a.durability * 5 + a.warranty * 3 - a.price / 1000;
      const scoreB = b.rating * 20 + b.durability * 5 + b.warranty * 3 - b.price / 1000;
      return scoreB - scoreA;
    })[0];
    container.innerHTML += `<div class="result-box"><h3>Suggested option</h3><p>${escapeHTML(best.name)} has the strongest combined demo comparison score. Consider your actual needs and budget before buying.</p></div>`;
  }
}

function removeComparison(index) {
  comparisonProducts.splice(index, 1);
  renderComparison();
}

function showPriceHistory() {
  const name = document.getElementById("trackerName").value.trim();
  const price = Number(document.getElementById("trackerPrice").value);

  if (!name || price <= 0) {
    alert("Enter a product name and valid price.");
    return;
  }

  const history = [
    price * 1.12,
    price * 1.08,
    price * 1.15,
    price * 1.04,
    price * 1.07,
    price * .98,
    price
  ];

  const canvas = document.getElementById("priceChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 700;
  const height = 260;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.height = height + "px";
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const min = Math.min(...history) * .95;
  const max = Math.max(...history) * 1.05;
  const x = i => 35 + i * (width - 65) / (history.length - 1);
  const y = v => height - 35 - (v - min) / (max - min) * (height - 70);

  ctx.strokeStyle = "#394563";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const lineY = 25 + i * (height - 60) / 3;
    ctx.beginPath();
    ctx.moveTo(35, lineY);
    ctx.lineTo(width - 15, lineY);
    ctx.stroke();
  }

  ctx.beginPath();
  history.forEach((value, i) => {
    if (i === 0) ctx.moveTo(x(i), y(value));
    else ctx.lineTo(x(i), y(value));
  });
  ctx.strokeStyle = "#9a83ff";
  ctx.lineWidth = 3;
  ctx.stroke();

  history.forEach((value, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(value), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#61b3ff";
    ctx.fill();
  });

  ctx.fillStyle = "#a6b0ca";
  ctx.font = "11px sans-serif";
  ["6 periods ago", "", "", "", "", "", "Now"].forEach((label, i) => {
    if (label) ctx.fillText(label, x(i) - 15, height - 10);
  });

  const result = document.getElementById("priceMessage");
  result.classList.remove("hidden");
  result.innerHTML = `<h3>${escapeHTML(name)}</h3><p>Current entered price: ₹${price.toLocaleString("en-IN")}</p><p>Illustrative trend only. Actual historical prices require retailer data.</p>`;
}

function analyzeReview() {
  const text = document.getElementById("reviewText").value.trim();
  if (text.length < 10) {
    alert("Please enter a longer review.");
    return;
  }

  const suspicious = [];
  if (text.length < 35) suspicious.push("Very short review");
  if ((text.match(/!/g) || []).length >= 3) suspicious.push("Excessive exclamation marks");
  if (/(best product ever|buy now|100% guaranteed|must buy|amazing amazing)/i.test(text)) suspicious.push("Promotional or repetitive language");
  if (/(\b\w+\b)(?:\s+\1){2,}/i.test(text)) suspicious.push("Repeated words");

  const result = document.getElementById("reviewResult");
  result.classList.remove("hidden");

  if (suspicious.length) {
    result.innerHTML = `<h3>Potentially Suspicious Review</h3><p>${suspicious.map(escapeHTML).join("<br>")}</p><p>Check the reviewer's history and other reviews before trusting it.</p>`;
  } else {
    result.innerHTML = `<h3>No obvious suspicious pattern found</h3><p>This does not guarantee that the review is genuine. Verify it using other sources.</p>`;
  }
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  const chat = document.getElementById("chatMessages");
  chat.innerHTML += `<div class="user-message">${escapeHTML(message)}</div>`;

  const q = message.toLowerCase();
  let reply = "Compare the product's price, customer ratings, warranty and durability before making a decision.";

  if (q.includes("price") || q.includes("cheap")) {
    reply = "Check the current price against previous prices and compare the same product across multiple stores. Avoid buying only because of a discount label.";
  } else if (q.includes("review") || q.includes("fake")) {
    reply = "Look for verified purchases, detailed experiences, repeated wording and balanced feedback. A text check alone cannot prove a review is fake.";
  } else if (q.includes("compare")) {
    reply = "Use the Smart Product Comparison section to compare up to four products using price, rating, warranty and durability.";
  } else if (q.includes("buy") || q.includes("best")) {
    reply = "Use the evaluation score as a starting point. Also consider your budget, required features, warranty and after-sales service.";
  } else if (q.includes("alert") || q.includes("notify")) {
    reply = "This prototype does not send automatic alerts yet. A notification service and product price data connection would be needed.";
  }

  chat.innerHTML += `<div class="bot-message">${escapeHTML(reply)}</div>`;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function addWishlist() {
  const name = document.getElementById("wishName").value.trim();
  const price = Number(document.getElementById("wishPrice").value);
  if (!name || price <= 0) {
    alert("Enter a product name and valid price.");
    return;
  }
  wishlist.push({ name, price });
  saveWishlist();
  document.getElementById("wishName").value = "";
  document.getElementById("wishPrice").value = "";
}

function saveEvaluatedProduct(name, price) {
  wishlist.push({ name, price });
  saveWishlist();
}

function saveWishlist() {
  localStorage.setItem("valuewiseWishlist", JSON.stringify(wishlist));
  renderWishlist();
}

function renderWishlist() {
  document.getElementById("wishCount").textContent = wishlist.length;
  document.getElementById("wishlistItems").innerHTML = wishlist.map((p, i) => `
    <div class="product-card">
      <h3>${escapeHTML(p.name)}</h3>
      <p>Price: ₹${Number(p.price).toLocaleString("en-IN")}</p>
      <button class="small-btn" onclick="removeWishlist(${i})">Remove</button>
    </div>
  `).join("") || "<p>Your wishlist is empty.</p>";
}

function removeWishlist(index) {
  wishlist.splice(index, 1);
  saveWishlist();
}

function openAuth() {
  document.getElementById("authModal").classList.remove("hidden");
}

function closeAuth() {
  document.getElementById("authModal").classList.add("hidden");
}

function toggleAuth() {
  signupMode = !signupMode;
  document.getElementById("authTitle").textContent = signupMode ? "Create Account" : "Welcome Back";
  document.getElementById("authSubtitle").textContent = signupMode ? "Join VALUEWISE" : "Login to your VALUEWISE account";
  document.querySelector(".auth-name").classList.toggle("hidden", !signupMode);
  document.querySelector(".auth-switch").textContent = signupMode ? "Already have an account? Login" : "Don't have an account? Sign up";
  document.getElementById("authMessage").textContent = "";
}

function handleAuth() {
  const name = document.getElementById("authName").value.trim();
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;
  const message = document.getElementById("authMessage");

  if (!email || !password || (signupMode && !name)) {
    message.textContent = "Please fill in all required fields.";
    return;
  }

  const users = JSON.parse(localStorage.getItem("valuewiseUsers") || "{}");

  if (signupMode) {
    if (users[email]) {
      message.textContent = "An account with this email already exists.";
      return;
    }
    users[email] = { name, password };
    localStorage.setItem("valuewiseUsers", JSON.stringify(users));
    message.textContent = "Demo account created. You can now log in.";
    toggleAuth();
  } else {
    if (users[email] && users[email].password === password) {
      message.textContent = "Welcome, " + users[email].name + "! Demo login successful.";
    } else {
      message.textContent = "Account not found or password incorrect. Try signing up first.";
    }
  }
}

renderWishlist();
