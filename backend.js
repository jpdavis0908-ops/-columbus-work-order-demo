(() => {
  const cfg = window.SAMS_PORTAL_CONFIG;
  if (!cfg) {
    console.warn("SAMS_PORTAL_CONFIG is missing.");
    return;
  }

  const client = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );

  async function submitWorkOrder(formData) {
    const { data, error } = await client.functions.invoke(
      cfg.SUBMIT_FUNCTION_NAME || "submit-work-order",
      { body: formData }
    );
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }


  async function getSession() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function getProfile() {
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await client
      .from("profiles")
      .select("id,full_name,email,organization,department,role,active")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async function getWorkOrders(filters = {}) {
    let q = client
      .from("work_orders")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (filters.status) q = q.eq("status", filters.status);
    if (filters.department) q = q.eq("department", filters.department);
    if (filters.priority) q = q.eq("priority", filters.priority);

    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  async function getWorkOrderByNumber(number) {
    const { data, error } = await client
      .from("work_orders")
      .select("*,work_order_events(*),attachments(*)")
      .eq("work_order_number", number)
      .single();
    if (error) throw error;
    return data;
  }

  async function updateWorkOrder(payload) {
    const { data, error } = await client.functions.invoke(
      cfg.UPDATE_FUNCTION_NAME || "update-work-order",
      { body: payload }
    );
    if (error) throw error;
    return data;
  }


  async function getWorkOrderByToken(workOrderNumber, token) {
    const { data, error } = await client.functions.invoke(
      "get-work-order-by-token",
      { body: { work_order_number: workOrderNumber, token } }
    );
    if (error) throw error;
    return data;
  }

  async function getFacilityByCode(code) {
    const { data, error } = await client
      .from("facilities")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .single();
    if (error) throw error;
    return data;
  }

  window.SamsPortalAPI = {
    supabase: client,
    submitWorkOrder,
    signIn,
    signOut,
    getSession,
    getProfile,
    getWorkOrders,
    getWorkOrderByNumber,
    getWorkOrderByToken,
    updateWorkOrder,
    getFacilityByCode,
  };
})();
