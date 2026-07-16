import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Receipt, 
  Plus, 
  Trash2, 
  DollarSign, 
  Store,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  UserPlus,
  ChevronRight,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  FileSearch,
  Pencil,
  Search
} from "lucide-react";
import { 
  Allowance, 
  AllowanceSupplier, 
  AllowanceOC, 
  AllowanceContract, 
  AllowanceInstallment, 
  AllowancePayment,
  AllowanceContractType,
  AllowancePeriodicity
} from "../types";
import { 
  db,
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  getDocs,
  doc,
  updateDoc,
  writeBatch
} from "../firebase-compat";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "../firestoreError";

interface DashboardProps {
  allowance: Allowance;
  user: any;
  onBack: () => void;
  onUpdateAllowanceValue?: (newValue: number) => Promise<void>;
}

type DashboardTab = "suppliers" | "ocs" | "contracts";

export function AllowanceDashboard({ allowance, user, onBack, onUpdateAllowanceValue }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("suppliers");
  const [suppliers, setSuppliers] = useState<AllowanceSupplier[]>([]);
  const [ocs, setOcs] = useState<AllowanceOC[]>([]);
  const [contracts, setContracts] = useState<AllowanceContract[]>([]);
  const [installments, setInstallments] = useState<AllowanceInstallment[]>([]);
  const [payments, setPayments] = useState<AllowancePayment[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<AllowanceInstallment | null>(null);
  const [showReparcelModal, setShowReparcelModal] = useState<AllowanceContract | null>(null);
  const [editingInstallment, setEditingInstallment] = useState<{ id: string, dueDate: string, value: string } | null>(null);
  const [isEditingAllowanceValue, setIsEditingAllowanceValue] = useState(false);
  const [editAllowanceValue, setEditAllowanceValue] = useState((allowance?.value ?? 0).toString());
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentsSubTab, setPaymentsSubTab] = useState<"contracts" | "history">("contracts");
  const [ocsSubTab, setOcsSubTab] = useState<"pending" | "approved">("pending");
  const [filterSupplierId, setFilterSupplierId] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Form states
  const [supplierForm, setSupplierForm] = useState({ name: "", cnpj: "", contact: "" });
  const [ocForm, setOcForm] = useState({ supplierId: "", number: "", value: "", description: "" });
  const [reparcelForm, setReparcelForm] = useState({ 
    count: "1", 
    periodicity: "Mensal" as AllowancePeriodicity, 
    startDate: new Date().toISOString().split('T')[0],
    values: [] as string[]
  });

  useEffect(() => {
    if (showReparcelModal) {
      const contract = showReparcelModal;
      const contractPayments = payments.filter(p => p.contractId === contract.id);
      const contractTotalPaid = contractPayments.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
      const repBalance = contract.totalValue - contractTotalPaid;
      
      setReparcelForm({
        count: "1",
        periodicity: contract.periodicity || "Mensal",
        startDate: new Date().toISOString().split('T')[0],
        values: [repBalance.toFixed(2)]
      });
    }
  }, [showReparcelModal, payments]);
  const [contractForm, setContractForm] = useState({ 
    supplierId: "", 
    type: "Subsídio de Obra" as AllowanceContractType, 
    totalValue: "", 
    installmentsCount: "1", 
    periodicity: "Mensal" as AllowancePeriodicity,
    startDate: new Date().toISOString().split('T')[0]
  });
  const [paymentForm, setPaymentForm] = useState<{
    date: string;
    value: string;
    method: "PIX" | "TED" | "Boleto" | "Outro";
    documentNumber: string;
    fileData?: string;
    fileName?: string;
    ocId?: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    value: "",
    method: "PIX",
    documentNumber: "",
    ocId: ""
  });

  const [showPaymentManager, setShowPaymentManager] = useState(false);
  const [editingPayment, setEditingPayment] = useState<AllowancePayment | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState<{
    date: string;
    value: string;
    method: "PIX" | "TED" | "Boleto" | "Outro";
    documentNumber: string;
    fileData?: string;
    fileName?: string;
    ocId?: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    value: "",
    method: "PIX",
    documentNumber: "",
    ocId: ""
  });
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<AllowancePayment | null>(null);

  useEffect(() => {
    if (editingPayment) {
      setEditPaymentForm({
        date: editingPayment.date || new Date().toISOString().split('T')[0],
        value: (editingPayment.value ?? 0).toString(),
        method: editingPayment.method || "PIX",
        documentNumber: editingPayment.documentNumber || "",
        fileData: editingPayment.invoiceUrl || "",
        fileName: editingPayment.invoiceName || "",
        ocId: editingPayment.ocId || ""
      });
    }
  }, [editingPayment]);

  useEffect(() => {
    if (!user?.uid) return;

    const queryBase = (coll: string) => query(
      collection(db, coll),
      where("allowanceId", "==", allowance.id)
    );

    const unsubSuppliers = onSnapshot(queryBase("allowance_suppliers"), (snap) => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AllowanceSupplier)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "allowance_suppliers"));

    const unsubOcs = onSnapshot(queryBase("allowance_ocs"), (snap) => {
      setOcs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AllowanceOC)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "allowance_ocs"));

    const unsubContracts = onSnapshot(queryBase("allowance_contracts"), (snap) => {
      setContracts(snap.docs.map(d => ({ id: d.id, ...d.data() } as AllowanceContract)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "allowance_contracts"));

    const unsubInstallments = onSnapshot(queryBase("allowance_installments"), (snap) => {
      setInstallments(snap.docs.map(d => ({ id: d.id, ...d.data() } as AllowanceInstallment)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "allowance_installments"));

    const unsubPayments = onSnapshot(queryBase("allowance_payments"), (snap) => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as AllowancePayment)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "allowance_payments"));

    return () => {
      unsubSuppliers();
      unsubOcs();
      unsubContracts();
      unsubInstallments();
      unsubPayments();
    };
  }, [allowance.id, user?.uid]);

  const totalCommitted = (contracts || []).reduce((acc, c) => acc + (Number(c.totalValue) || 0), 0);
  const totalPaid = (installments || []).reduce((acc, i) => acc + (Number(i.paidValue) || 0), 0);
  const openOCsValue = (ocs || []).filter(oc => oc.status !== "Reprovada").reduce((acc, oc) => acc + (Number(oc.value) || 0), 0);
  const balance = (Number(allowance?.value) ?? 0) - openOCsValue;

  const handleUpdateAllowanceValue = async () => {
    try {
      const parsedValue = parseFloat(editAllowanceValue.replace(/\./g, "").replace(",", "."));
      if (isNaN(parsedValue)) return toast.error("Valor inválido");

      if (onUpdateAllowanceValue) {
        await onUpdateAllowanceValue(parsedValue);
      } else {
        await updateDoc(doc(db, "allowances", allowance.id), {
          value: parsedValue
        });
      }
      setIsEditingAllowanceValue(false);
      toast.success("Valor do allowance atualizado!");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "allowances");
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) return toast.error("Nome é obrigatório");
    try {
      await addDoc(collection(db, "allowance_suppliers"), {
        ...supplierForm,
        allowanceId: allowance.id,
        ownerId: user.uid,
        createdAt: Date.now()
      });
      toast.success("Fornecedor cadastrado!");
      setShowAddModal(false);
      setSupplierForm({ name: "", cnpj: "", contact: "" });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, "allowance_suppliers"); }
  };

  const handleAddOC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocForm.supplierId || !ocForm.number || !ocForm.value) return toast.error("Campos obrigatórios faltando");
    try {
      await addDoc(collection(db, "allowance_ocs"), {
        ...ocForm,
        value: parseFloat(ocForm.value.replace(/\./g, "").replace(",", ".")),
        allowanceId: allowance.id,
        ownerId: user.uid,
        createdAt: Date.now(),
        status: "Aguardando"
      });
      toast.success("OC registrada!");
      setShowAddModal(false);
      setOcForm({ supplierId: "", number: "", value: "", description: "" });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, "allowance_ocs"); }
  };

  const approveAndGenerateContract = async (oc: AllowanceOC) => {
    const existingContract = contracts.find(c => c.ocNumber === oc.number && c.supplierId === oc.supplierId);
    if (existingContract) {
      toast.error("Já existe um contrato gerado para esta OC.");
      return;
    }

    try {
      const batchOp = writeBatch(db);
      
      const ocRef = doc(db, "allowance_ocs", oc.id);
      batchOp.update(ocRef, { status: "Aprovada" });

      const newContractRef = doc(collection(db, "allowance_contracts"));
      batchOp.set(newContractRef, {
        allowanceId: allowance.id,
        supplierId: oc.supplierId,
        type: "Subsídio de Obra",
        totalValue: oc.value,
        installmentsCount: 1,
        periodicity: "Mensal",
        startDate: new Date().toISOString().split('T')[0],
        status: "Ativo",
        ownerId: user.uid,
        createdAt: Date.now(),
        ocNumber: oc.number
      });

      const instRef = doc(collection(db, "allowance_installments"));
      batchOp.set(instRef, {
        contractId: newContractRef.id,
        allowanceId: allowance.id,
        number: 1,
        value: oc.value,
        paidValue: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: "Pendente",
        ownerId: user.uid,
        createdAt: Date.now()
      });

      await batchOp.commit();
      toast.success("OC Aprovada! Contrato e parcela padrão gerados na aba Aguardando Pagamento.");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "allowance_ocs_and_contracts");
    }
  };

  const handleUpdateOcStatus = async (oc: AllowanceOC, newStatus: string) => {
    if (newStatus === "Aprovada") {
      approveAndGenerateContract(oc);
      return;
    }
    try {
      await updateDoc(doc(db, "allowance_ocs", oc.id), { status: newStatus });
      toast.success(`Status da OC atualizado para ${newStatus}`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "allowance_ocs");
    }
  };

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.supplierId || !contractForm.totalValue || !contractForm.installmentsCount || !contractForm.startDate) {
      return toast.error("Preencha todos os campos obrigatórios");
    }

    try {
      const totalVal = parseFloat(contractForm.totalValue.replace(/\./g, "").replace(",", "."));
      const count = parseInt(contractForm.installmentsCount);
      const installmentValue = totalVal / count;

      // Create contract
      const contractData: Omit<AllowanceContract, "id"> = {
        allowanceId: allowance.id,
        supplierId: contractForm.supplierId,
        type: contractForm.type,
        totalValue: totalVal,
        installmentsCount: count,
        periodicity: contractForm.periodicity,
        startDate: contractForm.startDate,
        status: "Ativo",
        ownerId: user.uid,
        createdAt: Date.now()
      };

      const contractRef = await addDoc(collection(db, "allowance_contracts"), contractData);

      // Generate installments
      const generateNextDate = (start: string, monthsToAdd: number): string => {
        const d = new Date(start + 'T12:00:00Z'); // use noon to avoid timezone shift
        d.setMonth(d.getMonth() + monthsToAdd);
        return d.toISOString().split('T')[0];
      };

      const monthsMap: Record<AllowancePeriodicity, number> = {
        "Mensal": 1,
        "Bimestral": 2,
        "Trimestral": 3,
        "Semestral": 6,
        "Anual": 12
      };

      const step = monthsMap[contractForm.periodicity];

      for (let i = 0; i < count; i++) {
        const dueDate = generateNextDate(contractForm.startDate, i * step);
        const installmentData: Omit<AllowanceInstallment, "id"> = {
          contractId: contractRef.id,
          allowanceId: allowance.id,
          number: i + 1,
          dueDate,
          value: installmentValue,
          paidValue: 0,
          status: "Pendente",
          ownerId: user.uid,
          createdAt: Date.now()
        };
        await addDoc(collection(db, "allowance_installments"), installmentData);
      }

      toast.success("Contrato e parcelas gerados com sucesso!");
      setShowAddModal(false);
      setContractForm({ 
        supplierId: "", 
        type: "Subsídio de Obra", 
        totalValue: "", 
        installmentsCount: "1", 
        periodicity: "Mensal",
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "allowance_contracts");
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !paymentForm.value || !paymentForm.date) return toast.error("Preencha os campos obrigatórios");

    try {
      const payVal = parseFloat(paymentForm.value.replace(/\./g, "").replace(",", "."));
      
      // Register payment
      await addDoc(collection(db, "allowance_payments"), {
        installmentId: showPaymentModal.id,
        contractId: showPaymentModal.contractId,
        allowanceId: allowance.id,
        date: paymentForm.date,
        value: payVal,
        method: paymentForm.method,
        documentNumber: paymentForm.documentNumber,
        ocId: paymentForm.ocId || null,
        invoiceUrl: paymentForm.fileData || null,
        invoiceName: paymentForm.fileName || null,
        ownerId: user.uid,
        createdAt: Date.now()
      });

      // Update installment
      const newPaidValue = showPaymentModal.paidValue + payVal;
      const isPaid = newPaidValue >= showPaymentModal.value - 0.01; // handling floating point
      
      const installmentRef = doc(db, "allowance_installments", showPaymentModal.id);
      await updateDoc(installmentRef, {
        paidValue: newPaidValue,
        status: isPaid ? "Pago" : "Pendente",
        ocId: paymentForm.ocId || showPaymentModal.ocId || null
      });

      toast.success("Pagamento registrado!");
      setShowPaymentModal(null);
      setPaymentForm({
        date: new Date().toISOString().split('T')[0],
        value: "",
        method: "PIX",
        documentNumber: "",
        ocId: ""
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "allowance_payments");
    }
  };

  const handleEditPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment || !editPaymentForm.value || !editPaymentForm.date) {
      return toast.error("Preencha os campos obrigatórios");
    }

    try {
      const newValue = parseFloat(editPaymentForm.value.replace(/\./g, "").replace(",", "."));
      const oldValue = editingPayment.value;
      const diff = newValue - oldValue;

      const inst = installments.find(i => i.id === editingPayment.installmentId);
      if (!inst) {
        return toast.error("Parcela correspondente não encontrada.");
      }

      const newPaidValue = inst.paidValue + diff;
      const isPaid = newPaidValue >= inst.value - 0.01;

      const batchOp = writeBatch(db);

      const paymentRef = doc(db, "allowance_payments", editingPayment.id);
      batchOp.update(paymentRef, {
        value: newValue,
        date: editPaymentForm.date,
        method: editPaymentForm.method,
        documentNumber: editPaymentForm.documentNumber,
        ocId: editPaymentForm.ocId || null,
        invoiceUrl: editPaymentForm.fileData || null,
        invoiceName: editPaymentForm.fileName || null
      });

      const installmentRef = doc(db, "allowance_installments", inst.id);
      batchOp.update(installmentRef, {
        paidValue: newPaidValue,
        status: isPaid ? "Pago" : "Pendente"
      });

      await batchOp.commit();
      toast.success("Pagamento atualizado com sucesso!");
      setEditingPayment(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `allowance_payments/${editingPayment.id}`);
    }
  };

  const executeDeletePayment = async (payment: AllowancePayment) => {
    try {
      const inst = installments.find(i => i.id === payment.installmentId);
      if (!inst) {
        await deleteDoc(doc(db, "allowance_payments", payment.id));
        toast.success("Pagamento removido!");
        setPaymentToDelete(null);
        return;
      }

      const newPaidValue = Math.max(0, inst.paidValue - payment.value);
      const isPaid = newPaidValue >= inst.value - 0.01;

      const batchOp = writeBatch(db);

      batchOp.delete(doc(db, "allowance_payments", payment.id));

      const installmentRef = doc(db, "allowance_installments", inst.id);
      batchOp.update(installmentRef, {
        paidValue: newPaidValue,
        status: isPaid ? "Pago" : "Pendente"
      });

      await batchOp.commit();
      toast.success("Pagamento removido e saldo devedor atualizado!");
      setPaymentToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `allowance_payments/${payment.id}`);
    }
  };

  const handleReparcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReparcelModal) return;
    
    const contract = showReparcelModal;
    const contractPayments = payments.filter(p => p.contractId === contract.id);
    const contractTotalPaid = contractPayments.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
    const repBalance = contract.totalValue - contractTotalPaid;
    
    if (repBalance <= 0) return toast.error("Contrato sem saldo devedor.");

    // Parse values
    const parsedValues = reparcelForm.values.map(v => {
      const cleaned = v.replace(/\./g, "").replace(",", ".");
      return parseFloat(cleaned) || 0;
    });
    
    const totalNewValues = parsedValues.reduce((acc, v) => acc + (Number(v) || 0), 0);
    
    // Validate if sum matches balance (with small tolerance)
    if (Math.abs(totalNewValues - repBalance) > 0.05) {
      return toast.error(`A soma das parcelas (${formatCurrency(totalNewValues)}) deve ser igual ao saldo devedor (${formatCurrency(repBalance)})`);
    }
    
    try {
      const batchOp = writeBatch(db);
      
      const pendingInsts = installments.filter(i => i.contractId === contract.id && i.status !== "Pago");
      pendingInsts.forEach(i => {
         batchOp.delete(doc(db, "allowance_installments", i.id));
      });
      
      const paidInstsCount = installments.filter(i => i.contractId === contract.id && i.status === "Pago").length;
      const count = parsedValues.length;
      const startDateStr = reparcelForm.startDate || new Date().toISOString().split('T')[0];
      let currentDate = new Date(startDateStr + "T12:00:00Z");
      
      for (let i = 0; i < count; i++) {
        const instRef = doc(collection(db, "allowance_installments"));
        batchOp.set(instRef, {
          allowanceId: allowance.id,
          contractId: contract.id,
          number: paidInstsCount + i + 1,
          value: parsedValues[i],
          paidValue: 0,
          dueDate: currentDate.toISOString().split('T')[0],
          status: "Pendente",
          ownerId: user.uid,
          createdAt: Date.now()
        });
        
        switch (reparcelForm.periodicity) {
          case "Mensal": currentDate.setMonth(currentDate.getMonth() + 1); break;
          case "Bimestral": currentDate.setMonth(currentDate.getMonth() + 2); break;
          case "Trimestral": currentDate.setMonth(currentDate.getMonth() + 3); break;
          case "Semestral": currentDate.setMonth(currentDate.getMonth() + 6); break;
          case "Anual": currentDate.setFullYear(currentDate.getFullYear() + 1); break;
        }
      }
      
      batchOp.update(doc(db, "allowance_contracts", contract.id), {
         installmentsCount: paidInstsCount + count,
         periodicity: reparcelForm.periodicity
      });
      
      await batchOp.commit();
      toast.success("Parcelamento atualizado com sucesso!");
      setShowReparcelModal(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "allowance_installments");
    }
  };

  const handleUpdateInstallmentDate = async (id: string, newDate: string) => {
    try {
      const instRef = doc(db, "allowance_installments", id);
      await updateDoc(instRef, { dueDate: newDate });
      toast.success("Vencimento atualizado!");
      setEditingInstallment(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "allowance_installments");
    }
  };

  const handleUpdateInstallmentValue = async (id: string, newValue: number) => {
    try {
      const instRef = doc(db, "allowance_installments", id);
      await updateDoc(instRef, { value: newValue });
      toast.success("Valor da parcela atualizado!");
      setEditingInstallment(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "allowance_installments");
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    try {
      if (coll === "allowance_contracts") {
        const batchOp = writeBatch(db);
        batchOp.delete(doc(db, coll, id));
        
        installments.filter(i => i.contractId === id).forEach(i => {
           batchOp.delete(doc(db, "allowance_installments", i.id));
        });
        payments.filter(p => p.contractId === id).forEach(p => {
           batchOp.delete(doc(db, "allowance_payments", p.id));
        });

        const contract = contracts.find(c => c.id === id);
        if (contract && contract.ocNumber) {
           const linkedOC = ocs.find(o => o.number === contract.ocNumber && o.supplierId === contract.supplierId);
           if (linkedOC) {
              batchOp.update(doc(db, "allowance_ocs", linkedOC.id), { status: "Aguardando" });
           }
        }
        await batchOp.commit();
      } else if (coll === "allowance_ocs") {
        const batchOp = writeBatch(db);
        batchOp.delete(doc(db, coll, id));

        const oc = ocs.find(o => o.id === id);
        if (oc) {
          const linkedContract = contracts.find(c => c.ocNumber === oc.number && c.supplierId === oc.supplierId);
          if (linkedContract) {
             batchOp.delete(doc(db, "allowance_contracts", linkedContract.id));
             installments.filter(i => i.contractId === linkedContract.id).forEach(i => {
               batchOp.delete(doc(db, "allowance_installments", i.id));
             });
             payments.filter(p => p.contractId === linkedContract.id).forEach(p => {
               batchOp.delete(doc(db, "allowance_payments", p.id));
             });
          }
        }
        await batchOp.commit();
      } else {
        await deleteDoc(doc(db, coll, id));
      }
      toast.success("Item removido");
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `${coll}/${id}`); }
  };

  const formatCurrency = (val: number | undefined) => 
    (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || "N/A";
  const getOCNumber = (id: string) => ocs.find(o => o.id === id)?.number || "Sem OC";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 overflow-x-hidden px-1 md:px-0"
    >
      {/* Header with Stats */}
      <div className="space-y-4 md:space-y-6 px-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="p-2.5 md:p-3 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                 <Store className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-500 flex-shrink-0" />
                 <span className="text-slate-500 font-bold text-[9px] md:text-xs uppercase tracking-widest truncate">Allowance Dashboard</span>
              </div>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-black text-white font-display tracking-tight leading-tight truncate">
                {allowance.storeName}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setShowPaymentManager(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl flex items-center justify-center transition-all border border-slate-700 flex-shrink-0"
                title="Gerenciador de Pagamentos"
              >
                <CreditCard className="w-5 h-5 text-blue-500" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl flex items-center justify-center transition-all shadow-lg flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button
              onClick={() => setShowPaymentManager(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2.5 transition-all shadow-lg font-bold border border-slate-700 whitespace-nowrap"
            >
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span>Gerenciar Pagamentos</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2.5 transition-all shadow-lg font-bold whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Cadastrar Novo</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl p-4 group relative w-full">
             <p className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Allowance</p>
             {isEditingAllowanceValue ? (
               <div className="flex items-center gap-2 mt-1">
                 <input
                   autoFocus
                   type="text"
                   className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none focus:border-blue-500 font-bold text-sm md:text-base"
                   value={editAllowanceValue}
                   onChange={(e) => setEditAllowanceValue(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleUpdateAllowanceValue();
                     if (e.key === 'Escape') setIsEditingAllowanceValue(false);
                   }}
                 />
                 <button onClick={handleUpdateAllowanceValue} className="text-blue-500 hover:text-blue-400 p-1">
                   <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                 </button>
               </div>
             ) : (
               <div className="flex items-center justify-between group/edit">
                 <p className="text-base md:text-xl font-bold text-white cursor-pointer flex items-center gap-2" onClick={() => { setEditAllowanceValue(allowance.value.toString()); setIsEditingAllowanceValue(true); }}>
                   {formatCurrency(allowance.value)}
                   <Pencil className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-600 group-hover/edit:text-blue-500 transition-colors" />
                 </p>
               </div>
             )}
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl p-4 w-full">
             <p className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-1">Saldo Remanescente</p>
             <p className={`text-base md:text-xl font-bold ${balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
               {formatCurrency(balance)}
             </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl p-4 w-full">
             <p className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-1">Em aberto nas OCs</p>
             <p className="text-base md:text-xl font-bold text-yellow-500">
               {formatCurrency(openOCsValue)}
             </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl p-4 w-full">
             <p className="text-slate-500 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Pago</p>
             <p className="text-base md:text-xl font-bold text-emerald-500">
               {formatCurrency(totalPaid)}
             </p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto no-scrollbar ml-0 md:ml-2">
          <button
            onClick={() => { setActiveTab("suppliers"); setSearchTerm(""); }}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl flex items-center gap-2 font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === "suppliers" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Fornecedores
          </button>
          <button
            onClick={() => { setActiveTab("ocs"); setSearchTerm(""); }}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl flex items-center gap-2 font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === "ocs" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            OC
          </button>
          <button
            onClick={() => { setActiveTab("contracts"); setSearchTerm(""); }}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl flex items-center gap-2 font-bold transition-all whitespace-nowrap text-sm md:text-base ${
              activeTab === "contracts" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Pagamentos
          </button>
        </div>

        <div className="relative w-full md:w-72 px-2 md:px-0 mt-2 md:mt-0">
          <Search className="absolute left-6 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar por nome, OC ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-11 md:pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600 shadow-inner"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-6 px-4 md:px-2">
        <AnimatePresence mode="wait">
          {activeTab === "suppliers" && (
            <motion.div
              key="suppliers"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4"
            >
              {suppliers.filter(s => 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (s.cnpj || "").includes(searchTerm)
              ).map(s => (
                <div 
                  key={s.id} 
                  className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all shadow-sm group"
                >
                  {/* Lado Esquerdo */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-base font-bold text-white tracking-tight">{s.name}</h5>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-0.5 rounded-lg border border-slate-800">
                          CNPJ: {s.cnpj || "Não informado"}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-0.5 rounded-lg border border-slate-800">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {s.contact || "Sem contato"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito / Ações */}
                  <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
                    <button 
                      onClick={() => handleDelete("allowance_suppliers", s.id)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Excluir Fornecedor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {suppliers.filter(s => 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (s.cnpj || "").includes(searchTerm)
              ).length === 0 && (
                <div className="py-24 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                  <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <Building2 className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    {searchTerm ? "Nenhum fornecedor encontrado para sua busca." : "Nenhum fornecedor cadastrado para esta loja."}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "ocs" && (
            <motion.div
              key="ocs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Sub-Abas das OCs */}
              <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
                <button
                  onClick={() => setOcsSubTab("pending")}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border ${
                    ocsSubTab === "pending"
                      ? "bg-blue-600 text-white border-blue-500 shadow-md"
                      : "bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  Aguardando / Em Análise
                </button>
                <button
                  onClick={() => setOcsSubTab("approved")}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border ${
                    ocsSubTab === "approved"
                      ? "bg-blue-600 text-white border-blue-500 shadow-md"
                      : "bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Aprovadas (Lista)
                </button>
              </div>

              {ocsSubTab === "pending" ? (
                /* Aba Aguardando / Em Análise (Layout Lista) */
                <div className="flex flex-col gap-4">
                  {[...ocs].filter(o => {
                    const matchesSearch = o.number.toString().includes(searchTerm) || 
                      getSupplierName(o.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.description || "").toLowerCase().includes(searchTerm.toLowerCase());
                    const isPending = (o.status || "Aguardando") !== "Aprovada";
                    return matchesSearch && isPending;
                  }).sort((a, b) => {
                    const statusOrder = { "Aguardando": 0, "Reprovada": 1 };
                    const statusA = a.status || "Aguardando";
                    const statusB = b.status || "Aguardando";
                    const orderA = statusOrder[statusA as keyof typeof statusOrder] ?? 99;
                    const orderB = statusOrder[statusB as keyof typeof statusOrder] ?? 99;
                    
                    if (orderA !== orderB) return orderA - orderB;
                    
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  }).map(o => {
                    const isReprovada = o.status === "Reprovada";
                    return (
                      <div 
                        key={o.id}
                        className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all shadow-sm group"
                      >
                        {/* Lado Esquerdo */}
                        <div className="flex items-start gap-4">
                          <div className={`p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 ${
                            isReprovada ? "text-red-500" : "text-amber-500"
                          }`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 text-xs font-black rounded border ${
                                isReprovada ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>OC {o.number}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h5 className="text-base font-bold text-white tracking-tight pt-0.5">{getSupplierName(o.supplierId)}</h5>
                            <p className="text-sm text-slate-300 italic uppercase break-all">{o.description || "Sem descrição"}</p>
                          </div>
                        </div>

                        {/* Lado Direito / Ações */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <p className="text-lg md:text-xl font-extrabold text-white font-mono tracking-tight">
                              {formatCurrency(o.value)}
                            </p>
                            
                            <div className="mt-1 flex items-center md:justify-end gap-2">
                              <select
                                value={o.status || "Aguardando"}
                                onChange={(e) => handleUpdateOcStatus(o, e.target.value)}
                                className={`bg-slate-950 border border-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 outline-none transition-colors cursor-pointer ${
                                  (o.status || "Aguardando") === "Reprovada" ? "text-red-400" : "text-amber-400"
                                }`}
                              >
                                <option value="Aguardando" className="text-amber-400 bg-slate-950">Aguardando Avaliação</option>
                                <option value="Aprovada" className="text-emerald-400 bg-slate-950">Aprovada</option>
                                <option value="Reprovada" className="text-red-400 bg-slate-950">Reprovada</option>
                              </select>
                            </div>
                          </div>

                          {/* Botão de Excluir */}
                          <div className="flex items-center gap-1 ml-auto md:ml-0">
                            <button 
                               onClick={() => handleDelete("allowance_ocs", o.id)}
                               className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                               title="Excluir Ordem de Compra"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {[...ocs].filter(o => {
                    const matchesSearch = o.number.toString().includes(searchTerm) || 
                      getSupplierName(o.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.description || "").toLowerCase().includes(searchTerm.toLowerCase());
                    const isPending = (o.status || "Aguardando") !== "Aprovada";
                    return matchesSearch && isPending;
                  }).length === 0 && (
                    <div className="py-24 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                      <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                        <Clock className="w-8 h-8 text-slate-700" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {searchTerm ? "Nenhuma Ordem de Compra pendente encontrada." : "Nenhuma Ordem de Compra pendente."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Aba Aprovadas (Layout Lista) */
                <div className="flex flex-col gap-4">
                  {[...ocs].filter(o => {
                    const matchesSearch = o.number.toString().includes(searchTerm) || 
                      getSupplierName(o.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.description || "").toLowerCase().includes(searchTerm.toLowerCase());
                    const isApproved = o.status === "Aprovada";
                    return matchesSearch && isApproved;
                  }).sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  }).map(o => (
                    <div 
                      key={o.id}
                      className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all shadow-sm group"
                    >
                      {/* Lado Esquerdo */}
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 col-span-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded border border-emerald-500/20">OC {o.number}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h5 className="text-base font-bold text-white tracking-tight pt-0.5">{getSupplierName(o.supplierId)}</h5>
                          <p className="text-sm text-slate-300 italic uppercase break-all">{o.description || "Sem descrição"}</p>
                        </div>
                      </div>

                      {/* Lado Direito / Ações */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-lg md:text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
                            {formatCurrency(o.value)}
                          </p>
                          
                          <div className="mt-1 flex items-center md:justify-end gap-2">
                            <select
                              value={o.status || "Aprovada"}
                              onChange={(e) => handleUpdateOcStatus(o, e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 text-emerald-400 outline-none transition-colors cursor-pointer"
                            >
                              <option value="Aguardando" className="text-slate-300 bg-slate-950">Aguardando Avaliação</option>
                              <option value="Aprovada" className="text-emerald-400 bg-slate-950">Aprovada</option>
                              <option value="Reprovada" className="text-red-400 bg-slate-950">Reprovada</option>
                            </select>
                          </div>
                        </div>

                        {/* Botão de Excluir */}
                        <div className="flex items-center gap-1 ml-auto md:ml-0">
                          <button 
                             onClick={() => handleDelete("allowance_ocs", o.id)}
                             className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                             title="Excluir Ordem de Compra"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {[...ocs].filter(o => {
                    const matchesSearch = o.number.toString().includes(searchTerm) || 
                      getSupplierName(o.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (o.description || "").toLowerCase().includes(searchTerm.toLowerCase());
                    const isApproved = o.status === "Aprovada";
                    return matchesSearch && isApproved;
                  }).length === 0 && (
                    <div className="py-24 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                      <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                        <CheckCircle2 className="w-8 h-8 text-slate-700" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {searchTerm ? "Nenhuma Ordem de Compra aprovada encontrada." : "Nenhuma Ordem de Compra aprovada."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "contracts" && (
             <motion.div
                key="contracts"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
             >
                {selectedContractId && contracts.some(c => c.id === selectedContractId) ? (
                   <ContractDetail 
                      contract={contracts.find(c => c.id === selectedContractId)!}
                      installments={installments.filter(i => i.contractId === selectedContractId)}
                      payments={payments.filter(p => p.contractId === selectedContractId)}
                      suppliers={suppliers}
                      editingInstallment={editingInstallment}
                      setEditingInstallment={setEditingInstallment}
                      handleUpdateInstallmentDate={handleUpdateInstallmentDate}
                      handleUpdateInstallmentValue={handleUpdateInstallmentValue}
                      getOCNumber={getOCNumber}
                      onBack={() => setSelectedContractId(null)}
                      onPay={(inst) => setShowPaymentModal(inst)}
                      onDeleteInstallment={(id) => handleDelete("allowance_installments", id)}
                      onReparcel={() => setShowReparcelModal(contracts.find(c => c.id === selectedContractId)!)}
                      formatCurrency={formatCurrency}
                   />
                ) : (
                  <div className="space-y-6">
                    {/* Sub-Tabs Selector */}
                    <div className="flex items-center gap-2 border-b border-slate-800/40 pb-3">
                      <button
                        onClick={() => setPaymentsSubTab("contracts")}
                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border ${
                          paymentsSubTab === "contracts"
                            ? "bg-blue-600 text-white border-blue-500 shadow-md"
                            : "bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900/50"
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                        Contratos & Parcelas
                      </button>
                      <button
                        onClick={() => setPaymentsSubTab("history")}
                        className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-2 border ${
                          paymentsSubTab === "history"
                            ? "bg-blue-600 text-white border-blue-500 shadow-md"
                            : "bg-slate-900/30 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900/50"
                        }`}
                      >
                        <History className="w-4 h-4" />
                        Histórico de Lançamentos
                      </button>
                    </div>

                    {paymentsSubTab === "contracts" ? (
                      <div className="flex flex-col gap-4">
                        {[...contracts].filter(c => 
                          getSupplierName(c.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.type || "").toLowerCase().includes(searchTerm.toLowerCase())
                        ).sort((a, b) => {
                          const nextA = (installments || []).filter(i => i.contractId === a.id && i.status !== "Pago" && i.dueDate)
                            .map(i => {
                              const parts = i.dueDate.split('/');
                              if (parts.length < 3) return Infinity;
                              const [day, month, year] = parts;
                              return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
                            })
                            .sort((x, y) => x - y)[0] || Infinity;
                          const nextB = (installments || []).filter(i => i.contractId === b.id && i.status !== "Pago" && i.dueDate)
                            .map(i => {
                              const parts = i.dueDate.split('/');
                              if (parts.length < 3) return Infinity;
                              const [day, month, year] = parts;
                              return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
                            })
                            .sort((x, y) => x - y)[0] || Infinity;
                          return nextA - nextB;
                        }).map(c => {
                          const cInsts = installments.filter(i => i.contractId === c.id);
                          const paidInsts = cInsts.filter(i => i.status === "Pago").length;
                          const progress = cInsts.length > 0 ? (paidInsts / cInsts.length) * 100 : 0;
                          const totalPaidForContract = payments.filter(p => p.contractId === c.id).reduce((acc, p) => acc + (Number(p.value) || 0), 0);
                          const remaining = Number(c.totalValue) - totalPaidForContract;

                          const isContractOverdue = cInsts.some(i => {
                            if (i.status === "Pago") return false;
                            const parts = i.dueDate.split('/');
                            if (parts.length < 3) return false;
                            const [d, m, y] = parts;
                            return new Date(Number(y), Number(m) - 1, Number(d)) < new Date();
                          });
                          const isContractPaid = cInsts.length > 0 && cInsts.every(i => i.status === "Pago");

                          return (
                            <div 
                              key={c.id} 
                              onClick={() => setSelectedContractId(c.id)}
                              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all shadow-sm group cursor-pointer"
                            >
                              {/* Lado Esquerdo */}
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                      isContractPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                      isContractOverdue ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse" :
                                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    }`}>
                                      {isContractPaid ? "Quitado" : isContractOverdue ? "Atrasado" : "Em Dia"}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                                      {c.type}
                                    </span>
                                  </div>
                                  <h5 className="text-base font-bold text-white tracking-tight pt-1">{getSupplierName(c.supplierId)}</h5>
                                  
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-500">Progresso:</span>
                                      <span className="text-blue-400 font-bold">{Math.round(progress)}%</span>
                                      <span className="text-[10px] text-slate-500 italic">({paidInsts}/{cInsts.length} parcelas)</span>
                                    </div>
                                    
                                    {cInsts.filter(i => i.status !== "Pago" && i.dueDate).length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-500">Prox:</span>
                                        <div className="flex gap-1">
                                          {cInsts.filter(i => i.status !== "Pago" && i.dueDate)
                                            .sort((a, b) => {
                                              const partsA = a.dueDate.split('/');
                                              const partsB = b.dueDate.split('/');
                                              if (partsA.length < 3 || partsB.length < 3) return 0;
                                              return new Date(Number(partsA[2]), Number(partsA[1]) - 1, Number(partsA[0])).getTime() - 
                                                     new Date(Number(partsB[2]), Number(partsB[1]) - 1, Number(partsB[0])).getTime();
                                            })
                                            .slice(0, 2)
                                            .map(pi => {
                                              const parts = pi.dueDate.split('/');
                                              if (parts.length < 3) return null;
                                              const isOverdue = new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0])) < new Date();
                                              return (
                                                <span key={pi.id} className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                                  isOverdue ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-950/40 text-slate-300 border-slate-800'
                                                }`}>
                                                  {pi.dueDate}
                                                </span>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Lado Direito / Valores & Ações */}
                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0 shrink-0">
                                <div className="text-left md:text-right">
                                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total / Saldo Devedor</p>
                                  <div className="flex items-baseline gap-1.5 md:justify-end mt-0.5">
                                    <span className="text-xs font-bold text-slate-300">{formatCurrency(c.totalValue)}</span>
                                    <span className="text-xs text-slate-500">/</span>
                                    <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">{formatCurrency(remaining)}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 ml-auto md:ml-0">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete("allowance_contracts", c.id);
                                    }}
                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Excluir Contrato"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {contracts.filter(c => 
                          getSupplierName(c.supplierId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.type || "").toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="py-24 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                            <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                              <Receipt className="w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-slate-500 font-medium">
                              {searchTerm ? "Nenhum contrato encontrado para sua busca." : "Nenhum contrato cadastrado ainda."}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Histórico de Lançamentos */
                  <div className="space-y-6">
                    {/* Painel de Filtros */}
                    <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Search className="w-4 h-4 text-blue-500" />
                          Filtros Rápidos
                        </h4>
                        {(filterSupplierId || filterStartDate || filterEndDate) && (
                          <button
                            onClick={() => {
                              setFilterSupplierId("");
                              setFilterStartDate("");
                              setFilterEndDate("");
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1.5 transition-colors bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20"
                          >
                            Limpar Filtros
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Filtro Fornecedor */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Fornecedor</label>
                          <select
                            value={filterSupplierId}
                            onChange={(e) => setFilterSupplierId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-colors cursor-pointer"
                          >
                            <option value="">Todos os Fornecedores</option>
                            {suppliers.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Filtro Data Inicial */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">A partir de</label>
                          <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-colors cursor-pointer"
                          />
                        </div>

                        {/* Filtro Data Final */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">Até</label>
                          <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition-colors cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lista de Lançamentos de Pagamento */}
                    <div className="flex flex-col gap-4">
                      {(() => {
                        const filtered = payments.filter(p => {
                          const contract = contracts.find(c => c.id === p.contractId);
                          const supplierId = contract?.supplierId || "";
                          
                          if (filterSupplierId && supplierId !== filterSupplierId) {
                            return false;
                          }
                          if (filterStartDate && p.date < filterStartDate) {
                            return false;
                          }
                          if (filterEndDate && p.date > filterEndDate) {
                            return false;
                          }

                          const sName = getSupplierName(supplierId);
                          const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.documentNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.value.toString().includes(searchTerm);

                          return matchesSearch;
                        }).sort((a, b) => b.date.localeCompare(a.date));

                        if (filtered.length === 0) {
                          return (
                            <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                              <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                <FileSearch className="w-8 h-8 text-slate-700" />
                              </div>
                              <p className="text-slate-500 font-medium">
                                Nenhum pagamento encontrado com os filtros aplicados.
                              </p>
                            </div>
                          );
                        }

                        const formatPaymentDate = (dateStr: string) => {
                          if (!dateStr) return "";
                          const parts = dateStr.split("-");
                          if (parts.length === 3) {
                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                          }
                          return dateStr;
                        };

                        return filtered.map(p => {
                          const contract = contracts.find(c => c.id === p.contractId);
                          const sName = getSupplierName(contract?.supplierId || "");
                          const cType = contract?.type || "Contrato";

                          const methodStyle = {
                            PIX: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            TED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                            Boleto: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            Outro: "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }[p.method] || "bg-slate-500/10 text-slate-400 border-slate-500/20";

                          return (
                            <div 
                              key={p.id} 
                              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all shadow-sm group"
                            >
                              {/* Info da Esquerda */}
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                  {p.method === "PIX" || p.method === "TED" ? (
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                  ) : (
                                    <Receipt className="w-5 h-5 text-indigo-500" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-base font-bold text-white tracking-tight">{sName}</h5>
                                  <p className="text-xs text-slate-400">{cType}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1.5 bg-slate-950/40 px-2 py-0.5 rounded-lg border border-slate-800">
                                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                      {formatPaymentDate(p.date)}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-950/40 px-2 py-0.5 rounded-lg border border-slate-800">
                                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                      Nº Doc: {p.documentNumber || "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Centro/Direita */}
                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0 shrink-0">
                                <div className="text-left md:text-right">
                                  <p className="text-lg md:text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
                                    {formatCurrency(p.value)}
                                  </p>
                                  <div className="flex items-center md:justify-end gap-2 mt-1">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${methodStyle}`}>
                                      {p.method}
                                    </span>
                                    {p.invoiceUrl && (
                                      <a
                                        href={p.invoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        referrerPolicy="no-referrer"
                                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors ml-1"
                                      >
                                        <FileSearch className="w-3.5 h-3.5" />
                                        Comprovante
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Ações */}
                                <div className="flex items-center gap-1 ml-auto md:ml-0">
                                  <button
                                    onClick={() => setEditingPayment(p)}
                                    className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                                    title="Editar Pagamento"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setPaymentToDelete(p)}
                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Excluir Pagamento"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Registrar Pagamento</h3>
              <button onClick={() => setShowPaymentModal(null)} className="text-slate-500 hover:text-white p-2">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
               <p className="text-slate-400 text-xs mb-1">Parcela {showPaymentModal.number}</p>
               <p className="text-white font-bold text-lg">Valor: {formatCurrency(showPaymentModal.value)}</p>
               <p className="text-blue-400 text-xs mt-1">Saldo a pagar: {formatCurrency(showPaymentModal.value - showPaymentModal.paidValue)}</p>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</div>
                <input
                  placeholder="Valor do Pagamento"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                  value={paymentForm.value}
                  onChange={e => setPaymentForm({...paymentForm, value: e.target.value})}
                />
              </div>
              <input
                type="date"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                value={paymentForm.date}
                onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
              />
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                value={paymentForm.method}
                onChange={e => setPaymentForm({...paymentForm, method: e.target.value as any})}
              >
                <option value="PIX">PIX</option>
                <option value="TED">TED</option>
                <option value="Boleto">Boleto</option>
                <option value="Outro">Outro</option>
              </select>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Vincular a uma OC (Opcional)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={paymentForm.ocId}
                  onChange={e => setPaymentForm({...paymentForm, ocId: e.target.value})}
                >
                  <option value="">Nenhuma OC selecionada</option>
                  {ocs
                    .filter(o => {
                      const contract = contracts.find(c => c.id === showPaymentModal.contractId);
                      return o.supplierId === contract?.supplierId;
                    })
                    .map(o => (
                      <option key={o.id} value={o.id}>OC {o.number} - {formatCurrency(o.value)}</option>
                    ))
                  }
                </select>
              </div>

              <input
                placeholder="Nº Documento / Nota Fiscal"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                value={paymentForm.documentNumber}
                onChange={e => setPaymentForm({...paymentForm, documentNumber: e.target.value})}
              />
              
              <div className="space-y-2">
                <label className="text-slate-500 text-xs font-bold uppercase ml-1">Anexar Nota Fiscal (PDF)</label>
                <div className="relative group/file">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="nf-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          setPaymentForm({
                            ...paymentForm, 
                            fileData: re.target?.result as string,
                            fileName: file.name
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="nf-upload"
                    className="flex items-center justify-between w-full bg-slate-950 border border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl px-4 py-3 cursor-pointer transition-all"
                  >
                    <span className="text-slate-400 text-sm truncate">
                      {paymentForm.fileName || "Clique para anexar PDF"}
                    </span>
                    <Plus className="w-5 h-5 text-slate-500 group-hover/file:text-blue-500" />
                  </label>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold transition-all mt-4 border border-blue-400/20 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Confirmar Liquidação
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Reparcel Modal */}
      {showReparcelModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar Parcelamento</h3>
              <button onClick={() => setShowReparcelModal(null)} className="text-slate-500 hover:text-white p-2">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
               <p className="text-emerald-400 text-xs mt-1 text-center">
                 Serão geradas novas parcelas para o saldo devedor do contrato.
               </p>
            </div>

            <form onSubmit={handleReparcel} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Nº de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                    value={reparcelForm.count}
                    onChange={e => {
                      const newCount = parseInt(e.target.value) || 1;
                      const contract = showReparcelModal!;
                      const contractPayments = payments.filter(p => p.contractId === contract.id);
                      const contractTotalPaid = contractPayments.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
                      const repBalance = contract.totalValue - contractTotalPaid;
                      
                      const equalVal = (repBalance / newCount).toFixed(2);
                      const newVals = Array(newCount).fill(equalVal);
                      
                      setReparcelForm({
                        ...reparcelForm, 
                        count: e.target.value,
                        values: newVals
                      });
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Periodicidade</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                    value={reparcelForm.periodicity}
                    onChange={e => setReparcelForm({...reparcelForm, periodicity: e.target.value as any})}
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Início do Pagamento</label>
                <input
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                  value={reparcelForm.startDate}
                  onChange={e => setReparcelForm({...reparcelForm, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-3 mt-6">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Valores das Parcelas</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {reparcelForm.values.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</div>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-blue-600"
                          value={val}
                          onChange={e => {
                            const newVals = [...reparcelForm.values];
                            newVals[idx] = e.target.value;
                            setReparcelForm({...reparcelForm, values: newVals});
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {reparcelForm.values.length > 0 && (
                  <div className="flex justify-between items-center px-1 pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Soma Total</span>
                    <span className={`text-sm font-bold ${
                      Math.abs(reparcelForm.values.reduce((acc, v) => acc + (parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0), 0) - (showReparcelModal ? (showReparcelModal.totalValue - payments.filter(p => p.contractId === showReparcelModal.id).reduce((acc, p) => acc + (Number(p.value) || 0), 0)) : 0)) < 0.05 
                      ? "text-emerald-500" 
                      : "text-amber-500"
                    }`}>
                      {formatCurrency(reparcelForm.values.reduce((acc, v) => acc + (parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0), 0))}
                    </span>
                  </div>
                )}
              </div>

              <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-bold transition-all shadow-lg mt-4 border border-emerald-400/20">
                Confirmar
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white font-display">
                {activeTab === "suppliers" ? "Novo Fornecedor" : activeTab === "ocs" ? "Nova OC" : "Novo Contrato"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white p-2">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {activeTab === "suppliers" && (
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <input
                  placeholder="Nome da Empresa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  value={supplierForm.name}
                  onChange={e => setSupplierForm({...supplierForm, name: e.target.value})}
                />
                <input
                  placeholder="CNPJ (opcional)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  value={supplierForm.cnpj}
                  onChange={e => setSupplierForm({...supplierForm, cnpj: e.target.value})}
                />
                <input
                  placeholder="Contato / Responsável"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  value={supplierForm.contact}
                  onChange={e => setSupplierForm({...supplierForm, contact: e.target.value})}
                />
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold transition-all shadow-lg mt-4 border border-blue-400/20">
                  Salvar Fornecedor
                </button>
              </form>
            )}

            {activeTab === "ocs" && (
              <form onSubmit={handleAddOC} className="space-y-4">
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={ocForm.supplierId}
                  onChange={e => setOcForm({...ocForm, supplierId: e.target.value})}
                >
                  <option value="">Selecionar Fornecedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input
                  placeholder="Número da OC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={ocForm.number}
                  onChange={e => setOcForm({...ocForm, number: e.target.value})}
                />
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</div>
                   <input
                    placeholder="Valor Total"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={ocForm.value}
                    onChange={e => setOcForm({...ocForm, value: e.target.value})}
                  />
                </div>
                <textarea
                  placeholder="Descrição / Detalhes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 h-24 font-medium"
                  value={ocForm.description}
                  onChange={e => setOcForm({...ocForm, description: e.target.value})}
                />
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold transition-all shadow-lg border border-blue-400/20">
                  Registrar Ordem de Compra
                </button>
              </form>
            )}

            {activeTab === "contracts" && (
               <form onSubmit={handleAddContract} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 text-xs font-bold uppercase ml-1">Lojista / Prestador</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                      value={contractForm.supplierId}
                      onChange={e => setContractForm({...contractForm, supplierId: e.target.value})}
                    >
                      <option value="">Selecionar Prestador</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 text-xs font-bold uppercase ml-1">Tipo de Allowance</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                      value={contractForm.type}
                      onChange={e => setContractForm({...contractForm, type: e.target.value as any})}
                    >
                      <option value="Subsídio de Obra">Subsídio de Obra</option>
                      <option value="Carência de Aluguel">Carência de Aluguel</option>
                      <option value="Verba de Instalação">Verba de Instalação</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs font-bold uppercase ml-1">Valor Total</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</div>
                        <input
                          placeholder="0,00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                          value={contractForm.totalValue}
                          onChange={e => setContractForm({...contractForm, totalValue: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs font-bold uppercase ml-1">Nº Parcelas</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                        value={contractForm.installmentsCount}
                        onChange={e => setContractForm({...contractForm, installmentsCount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs font-bold uppercase ml-1">Periodicidade</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                        value={contractForm.periodicity}
                        onChange={e => setContractForm({...contractForm, periodicity: e.target.value as any})}
                      >
                        <option value="Mensal">Mensal</option>
                        <option value="Bimestral">Bimestral</option>
                        <option value="Trimestral">Trimestral</option>
                        <option value="Semestral">Semestral</option>
                        <option value="Anual">Anual</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 text-xs font-bold uppercase ml-1">1º Vencimento</label>
                      <input
                        type="date"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
                        value={contractForm.startDate}
                        onChange={e => setContractForm({...contractForm, startDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-bold transition-all shadow-lg mt-4 border border-emerald-400/20">
                    Gerar Contrato e Parcelas
                  </button>
               </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Payment Manager Modal */}
      {showPaymentManager && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white font-display">Gerenciador de Pagamentos</h3>
                <p className="text-slate-500 text-xs mt-0.5">Visualize, edite ou exclua todos os pagamentos realizados nesta allowance.</p>
              </div>
              <button 
                onClick={() => setShowPaymentManager(false)} 
                className="text-slate-500 hover:text-white p-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-6 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar por prestador, método ou nº documento..."
                value={managerSearchTerm}
                onChange={(e) => setManagerSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600 shadow-inner"
              />
            </div>

            {/* Payments List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {payments.filter(p => {
                const sName = getSupplierName(contracts.find(c => c.id === p.contractId)?.supplierId || "");
                return sName.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
                  (p.method || "").toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
                  (p.documentNumber || "").toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
                  String(p.value).includes(managerSearchTerm);
              }).length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-slate-950/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <Receipt className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 font-medium">Nenhum pagamento encontrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold sticky top-0">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Prestador</th>
                        <th className="px-4 py-3">Contrato / Tipo</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Método</th>
                        <th className="px-4 py-3">Nº Doc</th>
                        <th className="px-4 py-3 text-right rounded-r-xl">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {payments.filter(p => {
                        const sName = getSupplierName(contracts.find(c => c.id === p.contractId)?.supplierId || "");
                        return sName.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
                          (p.method || "").toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
                          (p.documentNumber || "").toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
                          String(p.value).includes(managerSearchTerm);
                      }).sort((a,b) => b.createdAt - a.createdAt).map(p => {
                        const contract = contracts.find(c => c.id === p.contractId);
                        const sName = getSupplierName(contract?.supplierId || "");
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                            <td className="px-4 py-4 text-white font-bold text-sm max-w-[150px] truncate" title={sName}>{sName}</td>
                            <td className="px-4 py-4 text-slate-400 text-xs truncate max-w-[120px]" title={contract?.type}>{contract?.type || "N/A"}</td>
                            <td className="px-4 py-4 text-emerald-500 font-bold text-sm">{formatCurrency(p.value)}</td>
                            <td className="px-4 py-4 text-slate-300 text-xs whitespace-nowrap">{p.date}</td>
                            <td className="px-4 py-4 text-slate-300 text-xs">
                              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold text-[10px]">{p.method}</span>
                            </td>
                            <td className="px-4 py-4 text-slate-300 text-xs truncate max-w-[100px]" title={p.documentNumber}>{p.documentNumber || "-"}</td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {p.invoiceUrl && (
                                  <button
                                    onClick={() => {
                                      const newWindow = window.open();
                                      if (newWindow) {
                                        newWindow.document.write(`
                                          <html>
                                            <body style="margin:0; background: #0b0f19; display: flex; align-items: center; justify-content: center; height: 100vh;">
                                              <iframe src="${p.invoiceUrl}" width="100%" height="100%" style="border:none;"></iframe>
                                            </body>
                                          </html>
                                        `);
                                      }
                                    }}
                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                                    title="Visualizar Nota Fiscal"
                                  >
                                    <FileSearch className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingPayment(p)}
                                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                  title="Editar Pagamento"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setPaymentToDelete(p)}
                                  className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Excluir Pagamento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Payment Sub-Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white font-display">Editar Pagamento</h3>
              <button onClick={() => setEditingPayment(null)} className="text-slate-500 hover:text-white p-2">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleEditPaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Valor do Pagamento</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</div>
                  <input
                    placeholder="0,00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={editPaymentForm.value}
                    onChange={e => setEditPaymentForm({...editPaymentForm, value: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Data do Pagamento</label>
                <input
                  type="date"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={editPaymentForm.date}
                  onChange={e => setEditPaymentForm({...editPaymentForm, date: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Método</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={editPaymentForm.method}
                  onChange={e => setEditPaymentForm({...editPaymentForm, method: e.target.value as any})}
                >
                  <option value="PIX">PIX</option>
                  <option value="TED">TED</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Vincular a uma OC (Opcional)</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={editPaymentForm.ocId}
                  onChange={e => setEditPaymentForm({...editPaymentForm, ocId: e.target.value})}
                >
                  <option value="">Nenhuma OC selecionada</option>
                  {ocs
                    .filter(o => {
                      const contract = contracts.find(c => c.id === editingPayment.contractId);
                      return o.supplierId === contract?.supplierId;
                    })
                    .map(o => (
                      <option key={o.id} value={o.id}>OC {o.number} - {formatCurrency(o.value)}</option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 text-[10px] uppercase font-bold ml-1">Nº Documento / Nota Fiscal</label>
                <input
                  placeholder="Nº do Documento"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={editPaymentForm.documentNumber}
                  onChange={e => setEditPaymentForm({...editPaymentForm, documentNumber: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-500 text-xs font-bold uppercase ml-1">Nota Fiscal (PDF)</label>
                <div className="relative group/editfile">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="edit-nf-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          setEditPaymentForm({
                            ...editPaymentForm, 
                            fileData: re.target?.result as string,
                            fileName: file.name
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="edit-nf-upload"
                    className="flex items-center justify-between w-full bg-slate-950 border border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl px-4 py-3 cursor-pointer transition-all"
                  >
                    <span className="text-slate-400 text-sm truncate">
                      {editPaymentForm.fileName || "Clique para substituir PDF"}
                    </span>
                    <Plus className="w-5 h-5 text-slate-500 group-hover/editfile:text-blue-500" />
                  </label>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl text-white font-bold transition-all mt-4 border border-blue-400/20 shadow-lg">
                Salvar Alterações
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Payment Confirmation Sub-Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="bg-red-500/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 animate-bounce">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Excluir Pagamento</h3>
            <p className="text-slate-400 text-sm mb-6">
              Tem certeza que deseja apagar o pagamento de <strong className="text-white">{formatCurrency(paymentToDelete.value)}</strong> feito em <strong className="text-white">{paymentToDelete.date}</strong>? O saldo devedor da parcela correspondente será recalculado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => executeDeletePayment(paymentToDelete)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/10"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// --- Sub-components ---

function ContractDetail({ 
  contract, 
  installments, 
  payments, 
  suppliers,
  editingInstallment,
  setEditingInstallment,
  handleUpdateInstallmentDate,
  handleUpdateInstallmentValue,
  getOCNumber,
  onBack, 
  onPay, 
  onDeleteInstallment,
  onReparcel,
  formatCurrency 
}: {
  contract: AllowanceContract;
  installments: AllowanceInstallment[];
  payments: AllowancePayment[];
  suppliers: AllowanceSupplier[];
  editingInstallment: { id: string, dueDate: string, value: string } | null;
  setEditingInstallment: (val: { id: string, dueDate: string, value: string } | null) => void;
  handleUpdateInstallmentDate: (id: string, newDate: string) => Promise<void>;
  handleUpdateInstallmentValue: (id: string, newValue: number) => Promise<void>;
  getOCNumber: (id: string) => string;
  onBack: () => void;
  onPay: (inst: AllowanceInstallment) => void;
  onDeleteInstallment: (id: string) => void;
  onReparcel: () => void;
  formatCurrency: (val: number) => string;
}) {
  const supplier = suppliers.find(s => s.id === contract.supplierId);
  const totalPaid = (payments || []).reduce((acc, p) => acc + (Number(p.value) || 0), 0);
  const balance = Number(contract.totalValue) - totalPaid;
  const nextInstallment = installments
    .filter(i => i.status !== "Pago")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const isContractOverdue = installments.some(i => {
    if (i.status === "Pago") return false;
    const [d, m, y] = i.dueDate.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d)) < new Date();
  });
  const isContractPaid = installments.length > 0 && installments.every(i => i.status === "Pago");

  return (
    <div className="space-y-6">
       <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all font-bold group text-sm md:text-base">
         <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
         <span className="truncate">Voltar para Lista de Contratos</span>
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="airo-card p-5 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
                   <div className="w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isContractPaid ? "bg-emerald-500/10 text-emerald-500" :
                          isContractOverdue ? "bg-red-500/10 text-red-500 animate-pulse" :
                          "bg-blue-500/10 text-blue-500"
                        }`}>
                          {isContractPaid ? "Quitado" : isContractOverdue ? "Atrasado" : "Em Dia"}
                        </span>
                        <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">• OC {contract.ocNumber || "S/N"}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight break-words">{supplier?.name || "Prestador"}</h2>
                      <p className="text-slate-400 font-medium text-sm md:text-base">{contract.type}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                   <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Valor Total</p>
                      <p className="text-lg md:text-xl font-bold text-white">{formatCurrency(contract.totalValue)}</p>
                   </div>
                   <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total Pago</p>
                      <p className="text-lg md:text-xl font-bold text-emerald-500">{formatCurrency(totalPaid)}</p>
                   </div>
                   <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Saldo Devedor</p>
                      <p className="text-lg md:text-xl font-bold text-blue-500">{formatCurrency(balance)}</p>
                   </div>
                </div>
             </div>

             <div className="airo-card overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Layers className="w-5 h-5 text-blue-500" />
                     Cronograma de Parcelas
                   </h3>
                   <button 
                     onClick={onReparcel}
                     className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700 hover:border-slate-600 shadow-sm"
                   >
                     Refazer Parcelamento
                   </button>
                </div>
                {/* Mobile view for installments */}
                <div className="block md:hidden divide-y divide-slate-800/50">
                  {installments.sort((a,b) => a.number - b.number).map(inst => (
                    <div key={inst.id} className="p-4 space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-slate-500 uppercase">{inst.number}ª Parcela</span>
                           {inst.status !== "Pago" && (
                              <button 
                                onClick={() => onDeleteInstallment(inst.id)}
                                className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Excluir Parcela"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          inst.status === "Pago" ? "bg-emerald-500/10 text-emerald-500" :
                          (new Date(inst.dueDate) < new Date() ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500")
                        }`}>
                          {inst.status === "Pago" ? "Pago" : (new Date(inst.dueDate) < new Date() ? "Em Atraso" : "Pendente")}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Vencimento</p>
                          <p className="text-sm font-bold text-white">{inst.dueDate}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Valor</p>
                          <p className="text-sm font-bold text-white">{formatCurrency(inst.value)}</p>
                        </div>
                      </div>

                      {inst.status !== "Pago" && (
                        <button 
                          onClick={() => onPay(inst)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
                        >
                          Efetuar Pagamento
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                         <tr>
                            <th className="px-6 py-4">Nº</th>
                            <th className="px-6 py-4">Vencimento</th>
                            <th className="px-6 py-4">Valor Previsto</th>
                            <th className="px-6 py-4">Pago</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                         {installments.sort((a,b) => a.number - b.number).map(inst => (
                            <tr key={inst.id} className="hover:bg-slate-800/30 transition-colors group">
                               <td className="px-6 py-4 text-slate-300 font-mono text-sm">{inst.number}ª</td>
                               <td className="px-6 py-4 text-white font-medium text-sm">
                                  {editingInstallment?.id === inst.id ? (
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="date"
                                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                                        value={editingInstallment.dueDate}
                                        onChange={(e) => setEditingInstallment({ ...editingInstallment, dueDate: e.target.value })}
                                      />
                                      <button 
                                        onClick={() => handleUpdateInstallmentDate(inst.id, editingInstallment.dueDate)}
                                        className="text-emerald-500 hover:text-emerald-400 p-1"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => setEditingInstallment(null)}
                                        className="text-slate-500 hover:text-white p-1"
                                      >
                                        <Plus className="w-4 h-4 rotate-45" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 group/date">
                                      {inst.dueDate}
                                      {inst.status !== "Pago" && (
                                        <button 
                                          onClick={() => setEditingInstallment({ id: inst.id, dueDate: inst.dueDate, value: inst.value.toString() })}
                                          className="opacity-0 group-hover/date:opacity-100 p-1 text-slate-500 hover:text-blue-500 transition-all"
                                        >
                                          <Calendar className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                               </td>
                               <td className="px-6 py-4 text-white font-bold text-sm">
                                  {editingInstallment?.id === inst.id ? (
                                     <div className="flex items-center gap-2">
                                       <input 
                                         type="text"
                                         className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-600 w-24"
                                         value={editingInstallment.value}
                                         onChange={(e) => setEditingInstallment({ ...editingInstallment, value: e.target.value })}
                                       />
                                       <button 
                                         onClick={() => {
                                           const val = parseFloat(editingInstallment.value.replace(/\./g, "").replace(",", "."));
                                           if (!isNaN(val)) handleUpdateInstallmentValue(inst.id, val);
                                         }}
                                         className="text-emerald-500 hover:text-emerald-400 p-1"
                                       >
                                         <CheckCircle2 className="w-4 h-4" />
                                       </button>
                                     </div>
                                  ) : (
                                     <div className="flex items-center gap-2 group/val">
                                       <span>{formatCurrency(inst.value)}</span>
                                       {inst.status !== "Pago" && (
                                         <button 
                                           onClick={() => setEditingInstallment({ id: inst.id, dueDate: inst.dueDate, value: inst.value.toString() })}
                                           className="opacity-0 group-hover/val:opacity-100 p-1 text-slate-500 hover:text-blue-500 transition-all"
                                         >
                                           <Pencil className="w-3 h-3" />
                                         </button>
                                       )}
                                     </div>
                                  )}
                               </td>
                               <td className="px-6 py-4 text-emerald-500 font-bold text-sm">{formatCurrency(inst.paidValue)}</td>
                               <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    inst.status === "Pago" ? "bg-emerald-500/10 text-emerald-500" :
                                    new Date(inst.dueDate) < new Date() ? "bg-red-500/10 text-red-500" :
                                    "bg-slate-800 text-slate-400"
                                  }`}>
                                    {inst.status === "Pago" ? "Pago" : (new Date(inst.dueDate) < new Date() ? "Em Atraso" : "Pendente")}
                                  </span>
                                  {inst.ocId && (
                                    <div className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                                      OC {getOCNumber(inst.ocId)}
                                    </div>
                                  )}
                               </td>
                               <td className="px-6 py-4 text-right">
                                  {inst.status !== "Pago" && (
                                     <button 
                                      onClick={() => onPay(inst)}
                                      className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg active:scale-95"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                    </button>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="airo-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  Histórico de Pagamentos
                </h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                   {payments.sort((a,b) => b.createdAt - a.createdAt).map(p => (
                      <div key={p.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 group relative">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-500">{p.date}</span>
                            <span className="text-emerald-500 font-bold">{formatCurrency(p.value)}</span>
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{p.method}</span>
                            {p.documentNumber && (
                               <>
                                 <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                 <span className="truncate max-w-[100px]">Doc: {p.documentNumber}</span>
                               </>
                            )}
                         </div>
                         {p.invoiceUrl && (
                            <button 
                              onClick={() => {
                                const newWindow = window.open();
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <html>
                                      <body style="margin:0;">
                                        <iframe src="${p.invoiceUrl}" width="100%" height="100%" style="border:none;"></iframe>
                                      </body>
                                    </html>
                                  `);
                                }
                              }}
                              className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase transition-all border border-blue-500/20"
                            >
                               <FileSearch className="w-3.5 h-3.5" />
                               Visualizar Nota Fiscal
                            </button>
                         )}
                      </div>
                   ))}
                   {payments.length === 0 && (
                      <p className="text-slate-500 text-sm italic text-center py-8">Nenhum pagamento registrado.</p>
                   )}
                </div>
             </div>

             <div className="airo-card p-6 bg-slate-900/30 border-dashed">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Regras de Liquidação
                </h4>
                <ul className="text-xs text-slate-500 space-y-2 list-disc ml-4">
                   <li>Pagamentos parciais são permitidos</li>
                   <li>Status muda para "Pago" ao atingir o valor total</li>
                   <li>Atrasos calculados automaticamente com base no vencimento</li>
                   <li>Relatórios gerados em tempo real</li>
                </ul>
             </div>
          </div>
       </div>
    </div>
  )
}
