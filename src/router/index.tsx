import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import RestaurantDetail from "./pages/RestaurantDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import RestaurantDashboard from "./pages/restaurant/Dashboard"
import RestaurantOrders from "./pages/restaurant/Orders"
import RestaurantMenu from "./pages/restaurant/Menu"
import DriverDashboard from "./pages/driver/Dashboard"
import DriverOrders from "./pages/driver/Orders"
import DriverEarnings from "./pages/driver/Earnings"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminRestaurants from "./pages/admin/Restaurants"
import AdminDrivers from "./pages/admin/Drivers"
import AdminOrders from "./pages/admin/Orders"
import AdminCommissions from "./pages/admin/Commissions"
import RegisterRestaurant from "./pages/restaurant/RegisterRestaurant"
import RegisterDriver from "./pages/driver/RegisterDriver"
import MyOrders from "./pages/MyOrders"
import RestaurantPromotions from "./pages/restaurant/RestaurantPromotions"
import AdminRoute from "./routes/AdminRoute"
import RestaurantRoute from "./routes/RestaurantRoute"
import DriverRoute from "./routes/DriverRoute"
import RestaurantProfile from "./pages/restaurant/RestaurantProfile"
import PaymentSuccess from "./pages/PaymentSuccess"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurant/register" element={<RegisterRestaurant />} />
        <Route path="/driver/register" element={<RegisterDriver />} />
        <Route path="/meus-pedidos" element={<MyOrders />} />
        <Route path="/restaurant/promotions" element={<RestaurantPromotions />} />
        <Route path="/restaurant/profile" element={<RestaurantProfile />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route
          path="/restaurant/dashboard"
          element={
            <RestaurantRoute>
              <RestaurantDashboard />
            </RestaurantRoute>
          }
        />
        <Route
          path="/restaurant/orders"
          element={
            <RestaurantRoute>
              <RestaurantOrders />
            </RestaurantRoute>
          }
        />
        <Route
          path="/restaurant/menu"
          element={
            <RestaurantRoute>
              <RestaurantMenu />
            </RestaurantRoute>
          }
        />

        <Route
          path="/driver/dashboard"
          element={
            <DriverRoute>
              <DriverDashboard />
            </DriverRoute>
          }
        />
        <Route
          path="/driver/orders"
          element={
            <DriverRoute>
              <DriverOrders />
            </DriverRoute>
          }
        />
        <Route
          path="/driver/earnings"
          element={
            <DriverRoute>
              <DriverEarnings />
            </DriverRoute>
          }
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/restaurants"
          element={
            <AdminRoute>
              <AdminRestaurants />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <AdminRoute>
              <AdminDrivers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/commissions"
          element={
            <AdminRoute>
              <AdminCommissions />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}